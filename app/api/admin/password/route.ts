import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ADMIN_PASSWORD_SETTING_KEY, isAuthenticated, verifyAdminPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminRateGuard } from "@/lib/admin-rate-limit";

const ChangePasswordInput = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(10, "Mật khẩu mới phải có ít nhất 10 ký tự")
      .max(200, "Mật khẩu mới quá dài")
      .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
        message: "Mật khẩu mới phải chứa cả chữ và số",
      }),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
  });

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = ChangePasswordInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const valid = await verifyAdminPassword(currentPassword);
  if (!valid) {
    return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 401 });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await db.setting.upsert({
    where: { key: ADMIN_PASSWORD_SETTING_KEY },
    update: { value: newHash },
    create: { key: ADMIN_PASSWORD_SETTING_KEY, value: newHash },
  });

  return NextResponse.json({ ok: true });
}
