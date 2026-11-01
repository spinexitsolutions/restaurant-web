import { insert, readDb, uid, upsertCustomer } from "@/lib/db";
import { bad, ok, str } from "@/lib/api";
import type { Order, OrderLine } from "@/lib/types";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const db = await readDb();
  const s = db.settings.ordering;
  if (!s.enabled) return bad("Online ordering is paused right now.");
  const name = str(b.name, 80);
  const phone = str(b.phone, 30);
  const type = b.type === "pickup" ? "pickup" : "delivery";
  const address = str(b.address, 300);
  if (!name || !phone) return bad("Name and phone are required.");
  if (type === "delivery" && !address) return bad("Please add a delivery address.");

  const lines: OrderLine[] = [];
  for (const l of Array.isArray(b.items) ? b.items : []) {
    const item = db.menuItems.find((m) => m.id === l.itemId && m.available);
    const qty = Math.max(1, Math.min(20, Number(l.qty) || 1));
    if (item) lines.push({ itemId: item.id, name: item.name, price: item.price, qty });
  }
  if (!lines.length) return bad("Your bag is empty.");
  const subtotal = lines.reduce((t, l) => t + l.price * l.qty, 0);
  if (subtotal < s.minOrder) return bad(`Minimum order is ${s.currency}${s.minOrder}.`);

  let discount = 0;
  let coupon = "";
  const code = str(b.coupon, 30).toUpperCase();
  if (code) {
    const offer = db.offers.find((o) => o.active && o.code.toUpperCase() === code);
    if (offer && subtotal >= offer.minOrder) {
      discount = Math.round((subtotal * offer.discount) / 100);
      coupon = offer.code;
    }
  }
  const deliveryFee = type === "delivery" && subtotal < s.freeDeliveryAbove ? s.deliveryFee : 0;
  const tax = Math.round(((subtotal - discount) * s.taxRate) / 100);
  const total = subtotal - discount + tax + deliveryFee;
  const order: Order = {
    id: uid("o"),
    code: "NR" + Math.floor(1000 + Math.random() * 9000) + Date.now().toString().slice(-2),
    name,
    phone,
    email: str(b.email, 120),
    address: type === "delivery" ? address : "",
    type,
    items: lines,
    subtotal,
    tax,
    deliveryFee,
    discount,
    coupon,
    total,
    payment: b.payment === "card" ? "card" : b.payment === "upi" ? "upi" : "cod",
    status: "new",
    notes: str(b.notes, 400),
    createdAt: new Date().toISOString(),
  };
  await insert("orders", order);
  await upsertCustomer({ name, email: order.email, phone, source: "Online order", spend: total, order: true });
  return ok({ ok: true, code: order.code });
}
