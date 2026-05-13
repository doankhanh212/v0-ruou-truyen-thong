import path from "node:path";

/**
 * Returns the absolute path of the directory where uploaded files are written.
 *
 * On VPS we run `next start` from `.next/standalone/`, so `process.cwd()` is
 * `<app>/.next/standalone/` — NOT the repo root. Writing to
 * `process.cwd()/public/uploads` there creates a parallel directory that Nginx
 * does NOT serve, and on first write fails with ENOENT because the `public/`
 * parent doesn't exist inside `standalone/`.
 *
 * Set `UPLOADS_DIR` in the PM2 / systemd environment to the absolute path that
 * Nginx's `alias` directive points at (e.g. `/var/www/ruoutruyenthong/public/uploads`).
 * For local dev (`pnpm dev`), leave it unset and we fall back to the in-repo
 * `public/uploads` folder.
 */
export function getUploadsDir(): string {
  const fromEnv = process.env.UPLOADS_DIR?.trim();
  if (fromEnv) return fromEnv;
  return path.join(process.cwd(), "public", "uploads");
}
