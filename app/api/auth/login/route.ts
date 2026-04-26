import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/admin-rate-limit";

export async function POST(request: NextRequest) {
  const ip = clientIp(request);

  // Per-IP guard: 5 attempts per 5 min.
  const ipLimit = await rateLimit(`login:ip:${ip}`, 5, 300);
  if (!ipLimit.success) {
    return NextResponse.json(
      { error: "Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": "300" } }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim().slice(0, 64) : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  // Per-username guard: 5 attempts per 15 min — defends against IP-rotating brute force.
  const userLimit = await rateLimit(
    `login:user:${username.toLowerCase()}`,
    5,
    900
  );
  if (!userLimit.success) {
    return NextResponse.json(
      { error: "Tài khoản tạm thời bị khóa do quá nhiều lần đăng nhập sai." },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  const success = await login(username, password);
  if (!success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
