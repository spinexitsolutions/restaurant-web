import { getSettings } from "@/lib/db";
import HomepageEditor from "@/components/admin/HomepageEditor";

export const dynamic = "force-dynamic";

export default async function Page() {
  return <HomepageEditor settings={await getSettings()} />;
}
