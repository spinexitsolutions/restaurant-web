import { readDb } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import MenuBrowser from "@/components/site/MenuBrowser";

export const metadata = { title: "Menu" };

export default async function MenuPage() {
  const db = await readDb();
  const categories = [...db.categories].sort((a, b) => a.order - b.order);
  const items = [...db.menuItems].sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader eyebrow="Menu" title="Eat with" accent="your hands." intro="Seasonal, fire-led and made from scratch every morning. Tap any dish for details, or add it straight to your bag for delivery or pickup." />
      <MenuBrowser categories={categories} items={items} />
    </>
  );
}
