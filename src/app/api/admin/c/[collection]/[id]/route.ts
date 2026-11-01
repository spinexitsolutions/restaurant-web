import { remove, update } from "@/lib/db";
import { bad, ok, requireAdmin } from "@/lib/api";
import { COLLECTIONS, type CollectionName } from "@/lib/types";

type Ctx = { params: Promise<{ collection: string; id: string }> };

function valid(name: string): name is CollectionName {
  return (COLLECTIONS as string[]).includes(name);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { collection, id } = await params;
  if (!valid(collection)) return bad("Unknown collection", 404);
  const item = await update(collection, id, await req.json());
  if (!item) return bad("Not found", 404);
  return ok(item);
}

export async function DELETE(_: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { collection, id } = await params;
  if (!valid(collection)) return bad("Unknown collection", 404);
  await remove(collection, id);
  return ok({ ok: true });
}
