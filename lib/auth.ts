import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SESSION_OPTIONS, SessionData } from "./session-options";
import { db } from "./db";

export const ADMIN_PASSWORD_SETTING_KEY = "admin_password_hash";

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

/**
 * Reads the currently active password hash.
 * - If the admin has changed their password through /admin/settings, the
 *   bcrypt hash lives in the Setting row keyed `admin_password_hash`.
 * - Otherwise, fall back to ADMIN_PASSWORD_HASH from the environment.
 */
async function getActivePasswordHash(): Promise<string | null> {
  try {
    const row = await db.setting.findUnique({
      where: { key: ADMIN_PASSWORD_SETTING_KEY },
      select: { value: true },
    });
    if (row?.value && row.value.startsWith("$2")) return row.value;
  } catch {
    // DB unavailable — fall through to env hash.
  }
  return process.env.ADMIN_PASSWORD_HASH ?? null;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = await getActivePasswordHash();
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function login(username: string, password: string): Promise<boolean> {
  const adminUser = process.env.ADMIN_USERNAME;
  if (!adminUser) return false;
  if (username !== adminUser) return false;

  const valid = await verifyAdminPassword(password);
  if (!valid) return false;

  const session = await getSession();
  session.isAdmin = true;
  await session.save();

  return true;
}

export async function logout(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isAdmin === true;
}
