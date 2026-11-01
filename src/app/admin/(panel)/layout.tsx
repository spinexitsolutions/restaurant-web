import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";
import Shell from "@/components/admin/Shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const db = await readDb();
  const counts = {
    reservations: db.reservations.filter((r) => r.status === "pending").length,
    orders: db.orders.filter((o) => o.status === "new").length,
    messages: db.messages.filter((m) => !m.read).length,
  };
  return (
    <Shell brand={db.settings.brand.name} counts={counts}>
      {children}
    </Shell>
  );
}
