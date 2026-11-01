import { readDb, writeDb } from "@/lib/db";
import { ok, requireAdmin } from "@/lib/api";
import type { Settings } from "@/lib/types";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return ok((await readDb()).settings);
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json()) as Partial<Settings>;
  const db = await writeDb((db) => {
    db.settings = { ...db.settings, ...body };
  });
  return ok(db.settings);
}
