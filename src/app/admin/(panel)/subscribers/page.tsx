import { readDb } from "@/lib/db";
import Subscribers from "@/components/admin/Subscribers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDb();
  return <Subscribers subscribers={db.subscribers} />;
}
