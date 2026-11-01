import { insert, list, uid } from "@/lib/db";
import { bad, ok, requireAdmin } from "@/lib/api";
import { COLLECTIONS, type CollectionName } from "@/lib/types";

type Ctx = { params: Promise<{ collection: string }> };

function valid(name: string): name is CollectionName {
  return (COLLECTIONS as string[]).includes(name);
}

export async function GET(_: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { collection } = await params;
  if (!valid(collection)) return bad("Unknown collection", 404);
  return ok(await list(collection));
}

export async function POST(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { collection } = await params;
  if (!valid(collection)) return bad("Unknown collection", 404);
  const body = await req.json();
  const item = { ...body, id: body.id || uid(collection.slice(0, 2)), createdAt: body.createdAt || new Date().toISOString() };
  await insert(collection, item);
  return ok(item);
}
