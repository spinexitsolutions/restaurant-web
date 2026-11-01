import Link from "next/link";
import { CalendarDays, Users, IndianRupee, UserPlus, Receipt, ArrowUpRight, Mail } from "lucide-react";
import { readDb } from "@/lib/db";
import { money, timeAgo, to12h, fmtDate } from "@/lib/format";
import { Card, PageHeader, StatusBadge, Avatar, Badge } from "@/components/admin/ui";
import RevenueChart from "@/components/admin/RevenueChart";

export const dynamic = "force-dynamic";

const ORDER_FLOW = ["new", "preparing", "ready", "out-for-delivery", "completed", "cancelled"] as const;

export default async function Dashboard() {
  const db = await readDb();
  const cur = db.settings.ordering.currency;
  const today = new Date().toISOString().slice(0, 10);
  const dayMs = 86400_000;
  const now = Date.now();

  const todays = db.reservations.filter((r) => r.date === today && r.status !== "cancelled");
  const covers = todays.reduce((s, r) => s + r.guests, 0);
  const valid = db.orders.filter((o) => o.status !== "cancelled");
  const last7 = valid.filter((o) => now - new Date(o.createdAt).getTime() < 7 * dayMs);
  const prev7 = valid.filter((o) => {
    const a = now - new Date(o.createdAt).getTime();
    return a >= 7 * dayMs && a < 14 * dayMs;
  });
  const rev7 = last7.reduce((s, o) => s + o.total, 0);
  const revPrev = prev7.reduce((s, o) => s + o.total, 0);
  const delta = revPrev ? Math.round(((rev7 - revPrev) / revPrev) * 100) : 100;
  const newCustomers = db.customers.filter((c) => now - new Date(c.createdAt).getTime() < 30 * dayMs).length;
  const aov = valid.length ? valid.reduce((s, o) => s + o.total, 0) / valid.length : 0;

  const series = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * dayMs);
    const key = d.toISOString().slice(0, 10);
    const value = valid.filter((o) => o.createdAt.slice(0, 10) === key).reduce((s, o) => s + o.total, 0);
    return { label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), value };
  });

  const byStatus = ORDER_FLOW.map((s) => ({ s, n: db.orders.filter((o) => o.status === s).length }));
  const maxStatus = Math.max(1, ...byStatus.map((b) => b.n));

  const dishMap = new Map<string, number>();
  valid.forEach((o) => o.items.forEach((l) => dishMap.set(l.name, (dishMap.get(l.name) || 0) + l.qty)));
  const topDishes = [...dishMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxDish = Math.max(1, ...topDishes.map((d) => d[1]));

  const upcoming = db.reservations
    .filter((r) => r.date >= today && ["pending", "confirmed"].includes(r.status))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 6);
  const latestOrders = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const messages = [...db.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  const kpis = [
    { label: "Bookings today", value: String(todays.length), sub: `${db.reservations.filter((r) => r.status === "pending").length} awaiting confirmation`, icon: CalendarDays, href: "/admin/reservations" },
    { label: "Covers today", value: String(covers), sub: "guests expected", icon: Users, href: "/admin/reservations" },
    { label: "Revenue · 7 days", value: money(rev7, cur), sub: `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}% vs previous week`, icon: IndianRupee, href: "/admin/orders", tone: delta >= 0 ? "text-emerald-600" : "text-red-500" },
    { label: "New guests · 30d", value: String(newCustomers), sub: `${db.customers.length} in CRM`, icon: UserPlus, href: "/admin/customers" },
    { label: "Avg. order value", value: money(aov, cur), sub: `${valid.length} orders total`, icon: Receipt, href: "/admin/orders" },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        title={`${greeting}.`}
        subtitle={`Here's what's happening at ${db.settings.brand.name} today.`}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k, i) => (
          <Link key={k.label} href={k.href} className={i === 0 ? "col-span-2 md:col-span-1" : ""}>
            <Card className="group h-full p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-mist text-neutral-700 group-hover:bg-[var(--accent)] group-hover:text-white">
                  <k.icon size={17} />
                </span>
                <ArrowUpRight size={16} className="text-neutral-300 transition group-hover:text-neutral-700" />
              </div>
              <div className="mt-4 text-[26px] font-semibold tracking-[-0.03em] sm:text-[28px]">{k.value}</div>
              <div className="text-[13px] font-medium text-neutral-700">{k.label}</div>
              <div className={`mt-0.5 text-xs ${k.tone || "text-neutral-400"}`}>{k.sub}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-neutral-500">Online revenue</div>
              <div className="text-2xl font-semibold tracking-tight">{money(series.reduce((s, x) => s + x.value, 0), cur)}</div>
              <div className="text-xs text-neutral-400">Last 14 days</div>
            </div>
            <Badge tone="green">Live</Badge>
          </div>
          <RevenueChart data={series} currency={cur} />
        </Card>
        <Card className="p-5">
          <div className="mb-4 text-sm font-semibold">Orders by status</div>
          <div className="space-y-3">
            {byStatus.map((b) => (
              <div key={b.s}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="capitalize text-neutral-600">{b.s.replace(/-/g, " ")}</span>
                  <span className="font-medium">{b.n}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-mist">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(b.n / maxStatus) * 100}%`, opacity: b.s === "cancelled" ? 0.35 : 0.5 + (b.n / maxStatus) * 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5">
          <SectionTitle title="Upcoming reservations" href="/admin/reservations" />
          <div className="divide-y divide-black/[0.05]">
            {upcoming.length === 0 && <p className="py-6 text-center text-sm text-neutral-400">No upcoming bookings</p>}
            {upcoming.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2.5">
                <div className="w-14 shrink-0 text-center">
                  <div className="text-[13px] font-semibold">{to12h(r.time).replace(" ", "")}</div>
                  <div className="text-[11px] text-neutral-400">{r.date === today ? "Today" : fmtDate(r.date, { day: "numeric", month: "short" })}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-neutral-500">
                    {r.guests} guests{r.occasion ? ` · ${r.occasion}` : ""}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Latest orders" href="/admin/orders" />
          <div className="divide-y divide-black/[0.05]">
            {latestOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 py-2.5">
                <Avatar name={o.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{o.name}</div>
                  <div className="text-xs text-neutral-500">
                    #{o.code} · {timeAgo(o.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{money(o.total, cur)}</div>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-4 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
          <Card className="p-5">
            <SectionTitle title="Top dishes" href="/admin/cms/menuItems" />
            <div className="space-y-2.5">
              {topDishes.map(([name, qty], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-semibold text-neutral-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="truncate font-medium">{name}</span>
                      <span className="text-neutral-500">{qty} sold</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-mist">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${(qty / maxDish) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Inbox" href="/admin/inbox" />
            <div className="space-y-3">
              {messages.map((m) => (
                <Link key={m.id} href="/admin/inbox" className="flex gap-3 rounded-xl p-1 hover:bg-mist">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-neutral-500">
                    <Mail size={14} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate">{m.subject}</span>
                      {!m.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />}
                    </div>
                    <div className="truncate text-xs text-neutral-500">
                      {m.name} · {timeAgo(m.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="text-sm font-semibold">{title}</div>
      <Link href={href} className="text-xs font-medium text-[var(--accent)] hover:underline">
        View all
      </Link>
    </div>
  );
}
