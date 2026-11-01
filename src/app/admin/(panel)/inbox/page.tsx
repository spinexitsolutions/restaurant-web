import { readDb } from "@/lib/db";
import Inbox from "@/components/admin/Inbox";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDb();
  return <Inbox messages={db.messages} />;
}
