import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const ADMIN_LIMIT = 60;
const ADMIN_WINDOW_SECONDS = 60;

/**
 * Resolves the originating client IP.
 *
 * Behind Nginx, `X-Real-IP` is set by us (the proxy) and clients cannot
 * spoof it — Nginx overwrites whatever the client sent. `X-Forwarded-For`
 * on the other hand is appended to, and the left-most value can be a lie.
 * So we prefer X-Real-IP and only fall back to the *right-most* trusted XFF
 * entry, with a length cap to defend against header-injection abuse.
 */
export function clientIp(request: NextRequest | { headers: Headers }): string {
  const headers = "headers" in request ? request.headers : (request as NextRequest).headers;
  const real = headers.get("x-real-ip");
  if (real) return real.trim().slice(0, 64);
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64);
  return "127.0.0.1";
}

/**
 * Reject cross-origin POSTs. iron-session cookies are `sameSite: "strict"`
 * which already blocks most CSRF, but checking `Origin` is a cheap belt-and-
 * braces against subdomain XSS or browser bugs. Returns null when the request
 * is same-origin (or has no Origin header, which same-origin fetches often
 * omit) so callers can proceed.
 */
export function checkOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (process.env.NODE_ENV !== "production") return null;
  const allowedOrigins = new Set<string>();
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  if (configured) {
    try {
      allowedOrigins.add(new URL(configured).origin);
    } catch {
      // Ignore malformed env; the request host below is still authoritative.
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  if (host) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const proto = forwardedProto || request.nextUrl.protocol.replace(":", "") || "https";
    try {
      allowedOrigins.add(new URL(`${proto}://${host}`).origin);
    } catch {
      // Ignore malformed proxy headers and fall through to reject.
    }
  }

  // If neither env nor proxy headers provide an origin, fail open.
  if (allowedOrigins.size === 0) return null;
  try {
    const originUrl = new URL(origin);
    if (allowedOrigins.has(originUrl.origin)) return null;
  } catch {
    // fall through to reject
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * Per-IP rate guard for mutating admin routes. Also checks Origin to make
 * CSRF harder. Returns a 4xx NextResponse if the request should be denied,
 * or null if it may proceed. Fails open if Redis is unavailable (handled
 * inside `rateLimit`).
 */
export async function adminRateGuard(request: NextRequest): Promise<NextResponse | null> {
  const originReject = checkOrigin(request);
  if (originReject) return originReject;

  const ip = clientIp(request);
  const result = await rateLimit(`admin:${ip}`, ADMIN_LIMIT, ADMIN_WINDOW_SECONDS);
  if (!result.success) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút." },
      {
        status: 429,
        headers: {
          "Retry-After": String(ADMIN_WINDOW_SECONDS),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }
  return null;
}
