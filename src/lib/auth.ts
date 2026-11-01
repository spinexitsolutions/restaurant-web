import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "noor_admin";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@noor.kitchen";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "noor2026";
const SECRET = process.env.ADMIN_SECRET || "noor-demo-secret-change-me";

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function checkCredentials(email: string, password: string) {
  const a = Buffer.from(sign(`${email.trim().toLowerCase()}:${password}`));
  const b = Buffer.from(sign(`${ADMIN_EMAIL.toLowerCase()}:${ADMIN_PASSWORD}`));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sessionToken() {
  return sign(`session:${ADMIN_EMAIL}:${ADMIN_PASSWORD}`);
}

export async function isAdmin() {
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!c) return false;
  const expected = sessionToken();
  return c.length === expected.length && timingSafeEqual(Buffer.from(c), Buffer.from(expected));
}
