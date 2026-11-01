import { readDb } from "@/lib/db";
import Orders from "@/components/admin/Orders";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDb();
  return <Orders orders={db.orders} currency={db.settings.ordering.currency} />;
}
