import { insert, getSettings, uid, upsertCustomer } from "@/lib/db";
import { bad, ok, str } from "@/lib/api";
import type { Reservation } from "@/lib/types";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const settings = await getSettings();
  if (!settings.reservations.enabled) return bad("Online reservations are paused right now.");
  const name = str(b.name, 80);
  const phone = str(b.phone, 30);
  const email = str(b.email, 120);
  const date = str(b.date, 10);
  const time = str(b.time, 5);
  const guests = Math.max(1, Math.min(settings.reservations.maxGuests, Number(b.guests) || 2));
  if (!name || !phone || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return bad("Please fill in your name, phone, date and time.");
  }
  if (new Date(date + "T23:59:59") < new Date()) return bad("Please choose a date in the future.");
  const r: Reservation = {
    id: uid("r"),
    name,
    phone,
    email,
    date,
    time,
    guests,
    occasion: str(b.occasion, 40),
    notes: str(b.notes, 500),
    status: "pending",
    table: "",
    createdAt: new Date().toISOString(),
  };
  await insert("reservations", r);
  await upsertCustomer({ name, email, phone, source: "Website", visit: true });
  return ok({ ok: true, id: r.id });
}
