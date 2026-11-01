import { readDb } from "@/lib/db";
import Customers from "@/components/admin/Customers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDb();
  return <Customers customers={db.customers} reservations={db.reservations} orders={db.orders} currency={db.settings.ordering.currency} />;
}
