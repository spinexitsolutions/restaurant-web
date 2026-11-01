import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkCredentials, sessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!checkCredentials(String(b.email || ""), String(b.password || ""))) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
