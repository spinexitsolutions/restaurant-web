import { insert, uid, upsertCustomer } from "@/lib/db";
import { bad, ok, str } from "@/lib/api";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = str(b.name, 80);
  const email = str(b.email, 120);
  const message = str(b.message, 3000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) return bad("Please add your name, a valid email and a message.");
  await insert("messages", {
    id: uid("ms"),
    name,
    email,
    phone: str(b.phone, 30),
    subject: str(b.subject, 120) || "General enquiry",
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
  await upsertCustomer({ name, email, phone: str(b.phone, 30), source: "Contact form" });
  return ok({ ok: true });
}
