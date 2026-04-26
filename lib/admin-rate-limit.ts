import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const ADMIN_LIMIT = 60;
const ADMIN_WINDOW_SECONDS = 60;

export function clientIp(request: NextRequest | { headers: Headers }): string {
  const headers = "headers" in request ? request.headers : (request as NextRequest).headers;
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Per-IP rate guard for mutating admin routes.
 * Returns a 429 NextResponse if the limit is exceeded, or null if the request
 * may proceed. Fails open if Redis is unavailable (handled inside `rateLimit`).
 */
export async function adminRateGuard(request: NextRequest): Promise<NextResponse | null> {
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
