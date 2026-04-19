export interface SessionData {
  isAdmin?: boolean;
}

export const SESSION_SECRET =
  process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long!!!";

export const SESSION_OPTIONS = {
  password: SESSION_SECRET,
  cookieName: "session_token",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 86400,
  },
};
