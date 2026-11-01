import { notFound } from "next/navigation";
import { list } from "@/lib/db";
import OrderTracker from "@/components/site/OrderTracker";

export const metadata = { title: "Track your order" };

export default async function TrackPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const o = (await list("orders")).find((x) => x.code.toUpperCase() === code.toUpperCase());
  if (!o) notFound();
  return (
    <div className="pt-32 sm:pt-40">
      <OrderTracker initial={{ code: o.code, status: o.status, type: o.type, items: o.items, total: o.total, createdAt: o.createdAt, name: o.name.split(" ")[0] }} />
    </div>
  );
}
