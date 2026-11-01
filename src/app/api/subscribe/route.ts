import { insert, list, uid } from "@/lib/db";
import { bad, ok, str } from "@/lib/api";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const email = str(b.email, 120).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return bad("Please enter a valid email.");
  const existing = (await list("subscribers")).some((s) => s.email === email);
  if (!existing) await insert("subscribers", { id: uid("s"), email, createdAt: new Date().toISOString() });
  return ok({ ok: true });
}
