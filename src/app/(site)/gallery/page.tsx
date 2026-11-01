import { readDb } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import GalleryGrid from "@/components/site/GalleryGrid";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const db = await readDb();
  return (
    <>
      <PageHeader eyebrow="Gallery" title="Moments," accent="mostly delicious." intro="The room, the fire, the food and the people who make it all glow." />
      <GalleryGrid images={[...db.gallery].sort((a, b) => a.order - b.order)} />
    </>
  );
}
