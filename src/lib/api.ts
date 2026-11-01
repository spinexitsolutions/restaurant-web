import "server-only";
import { NextResponse } from "next/server";
import { isAdmin } from "./auth";

export const ok = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);
export const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export async function requireAdmin() {
  if (!(await isAdmin())) return bad("Unauthorized", 401);
  return null;
}

export function str(v: unknown, max = 2000) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
