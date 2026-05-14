import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

export type AdminCredentials = {
  email: string;
  password: string;
  sessionSecret: string;
};

export function getAdminCredentials(): AdminCredentials | null {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!email || !password || !sessionSecret) return null;
  return { email, password, sessionSecret };
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Still do a comparison to avoid timing leak on length
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const creds = getAdminCredentials();
  if (!creds) return false;
  const emailOk = timingSafeStringEqual(
    email.trim().toLowerCase(),
    creds.email.trim().toLowerCase(),
  );
  const passwordOk = timingSafeStringEqual(password, creds.password);
  return emailOk && passwordOk;
}

export function issueAdminToken(): string | null {
  const creds = getAdminCredentials();
  if (!creds) return null;
  const payload = `admin.${Date.now()}.${crypto.randomBytes(8).toString("hex")}`;
  return `${payload}.${sign(payload, creds.sessionSecret)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const creds = getAdminCredentials();
  if (!creds) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [scope, ts, nonce, sig] = parts;
  if (scope !== "admin") return false;
  const issuedAt = Number(ts);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > TOKEN_TTL_MS) {
    return false;
  }
  const expected = sign(`${scope}.${ts}.${nonce}`, creds.sessionSecret);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
