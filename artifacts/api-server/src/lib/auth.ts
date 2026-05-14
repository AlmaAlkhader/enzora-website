import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-session-secret";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

if (process.env.NODE_ENV === "production") {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set in production");
  }
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD must be set in production");
  }
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");
}

export function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw && pw.length > 0) return pw;
  // Fallback for first-run convenience; the user is asked to set ADMIN_PASSWORD.
  return "enzora-admin";
}

export function issueAdminToken(): string {
  const payload = `admin.${Date.now()}.${crypto.randomBytes(8).toString("hex")}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [scope, ts, nonce, sig] = parts;
  if (scope !== "admin") return false;
  const issuedAt = Number(ts);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > TOKEN_TTL_MS) {
    return false;
  }
  const expected = sign(`${scope}.${ts}.${nonce}`);
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
