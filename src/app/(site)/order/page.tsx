import { readDb } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import Checkout from "@/components/site/Checkout";

export const metadata = { title: "Order online" };

export default async function OrderPage() {
  const db = await readDb();
  const suggestions = db.menuItems.filter((m) => m.available && (m.tags.includes("bestseller") || m.featured)).slice(0, 6);
  return (
    <>
      <PageHeader eyebrow="Order online" title="Noor," accent="at home." intro={`Delivered hot across Bandra, Khar & Juhu in about ${db.settings.ordering.etaMinutes} minutes — or swing by and pick it up.`} />
      <Checkout suggestions={suggestions} />
    </>
  );
}
