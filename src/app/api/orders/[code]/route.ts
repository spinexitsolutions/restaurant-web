import { list } from "@/lib/db";
import { bad, ok } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const o = (await list("orders")).find((x) => x.code.toUpperCase() === code.toUpperCase());
  if (!o) return bad("Order not found", 404);
  return ok({ code: o.code, status: o.status, type: o.type, items: o.items, total: o.total, createdAt: o.createdAt, name: o.name.split(" ")[0] });
}
