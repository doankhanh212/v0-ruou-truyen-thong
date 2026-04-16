import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

interface SessionData {
  isAdmin?: boolean;
}

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long!!!",
  cookieName: "session_token",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 86400, // 24h
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

export async function login(username: string, password: string): Promise<boolean> {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUser || !adminHash) return false;
  if (username !== adminUser) return false;

  const valid = await bcrypt.compare(password, adminHash);
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
