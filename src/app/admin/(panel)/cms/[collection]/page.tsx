import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import type { CollectionName } from "@/lib/types";
import CollectionEditor from "@/components/admin/CollectionEditor";

export const dynamic = "force-dynamic";

const ALLOWED = ["menuItems", "categories", "gallery", "team", "events", "posts", "offers", "testimonials", "faqs"] as const;

export default async function Page({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!(ALLOWED as readonly string[]).includes(collection)) notFound();
  const db = await readDb();
  const items = db[collection as CollectionName] as unknown as (Record<string, unknown> & { id: string })[];
  return <CollectionEditor key={collection} collection={collection} items={items} categories={db.categories} currency={db.settings.ordering.currency} />;
}
