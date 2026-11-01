import { resetDb } from "@/lib/db";
import { ok, requireAdmin } from "@/lib/api";

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  await resetDb();
  return ok({ ok: true });
}
