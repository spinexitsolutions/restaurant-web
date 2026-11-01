import { readDb } from "@/lib/db";
import Reservations from "@/components/admin/Reservations";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDb();
  return <Reservations reservations={db.reservations} slots={db.settings.reservations.slots} maxGuests={db.settings.reservations.maxGuests} />;
}
