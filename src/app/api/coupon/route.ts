import { list } from "@/lib/db";
import { bad, ok, str } from "@/lib/api";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const code = str(b.code, 30).toUpperCase();
  const subtotal = Number(b.subtotal) || 0;
  const offer = (await list("offers")).find((o) => o.active && o.code.toUpperCase() === code);
  if (!offer) return bad("That code isn't valid.");
  if (subtotal < offer.minOrder) return bad(`Add items worth ₹${offer.minOrder - subtotal} more to use ${offer.code}.`);
  return ok({ code: offer.code, discount: offer.discount, title: offer.title });
}
