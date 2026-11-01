"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Download, Plus, Trash2, Users, CalendarDays, ShoppingBag, Phone, Mail, X } from "lucide-react";
import type { Customer, Order, Reservation } from "@/lib/types";
import { money, timeAgo, fmtDate, to12h } from "@/lib/format";
import { api, Avatar, Badge, Button, Card, Drawer, Empty, PageHeader, SearchInput, Segmented, StatusBadge, TextArea, TextField, downloadCsv, useConfirm, useToast, cx } from "./ui";

const tagTone = (t: string) => (t === "VIP" ? "dark" : t === "Regular" ? "green" : t === "New" ? "blue" : "neutral");

export default function Customers({ customers, reservations, orders, currency }: { customers: Customer[]; reservations: Reservation[]; orders: Order[]; currency: string }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const [sort, setSort] = useState<"recent" | "spend" | "visits">("recent");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const allTags = useMemo(() => ["All", ...Array.from(new Set(["VIP", "Regular", "New", ...customers.flatMap((c) => c.tags)]))], [customers]);
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return customers
      .filter((c) => (tag === "All" || c.tags.includes(tag)) && (!s || [c.name, c.email, c.phone, c.notes].some((v) => v.toLowerCase().includes(s))))
      .sort((a, b) => (sort === "spend" ? b.totalSpent - a.totalSpent : sort === "visits" ? b.visits - a.visits : b.lastSeen.localeCompare(a.lastSeen)));
  }, [customers, q, tag, sort]);

  const open = customers.find((c) => c.id === openId) || null;
  const ltv = customers.reduce((s, c) => s + c.totalSpent, 0);
  const vip = customers.filter((c) => c.tags.includes("VIP")).length;

  async function save(id: string, data: Partial<Customer>) {
    try {
      await api(`/api/admin/c/customers/${id}`, "PATCH", data);
      toast("Guest profile saved");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }
  async function del(c: Customer) {
    if (!(await confirm(`Remove ${c.name} from the CRM?`))) return;
    await api(`/api/admin/c/customers/${c.id}`, "DELETE");
    setOpenId(null);
    toast("Guest removed");
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="Guests"
        subtitle="Every guest who booked, ordered or wrote to you — automatically."
        actions={
          <>
            <Button onClick={() => downloadCsv("customers.csv", filtered.map(({ id, ...c }) => ({ ...c, tags: c.tags.join("; "), _id: id })))}>
              <Download size={15} /> Export CSV
            </Button>
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus size={16} /> Add guest
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Total guests", v: String(customers.length) },
          { l: "VIPs", v: String(vip) },
          { l: "Lifetime value", v: money(ltv, currency) },
          { l: "Avg. spend / guest", v: money(customers.length ? ltv / customers.length : 0, currency) },
        ].map((k) => (
          <Card key={k.l} className="p-4">
            <div className="text-xs text-neutral-500">{k.l}</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">{k.v}</div>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {allTags.map((t) => (
            <button key={t} onClick={() => setTag(t)} className={cx("whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition", tag === t ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-white text-neutral-600 hover:border-black/30")}>
              {t === "VIP" && <Crown size={12} className="mr-1 inline" />}
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Segmented layoutId="cust-sort" value={sort} onChange={setSort} options={[{ value: "recent", label: "Recent" }, { value: "spend", label: "Top spend" }, { value: "visits", label: "Most visits" }]} />
          <SearchInput value={q} onChange={setQ} placeholder="Search guests…" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty icon={<Users size={32} />} title="No guests found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} onClick={() => setOpenId(c.id)} className="cursor-pointer p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <Avatar name={c.name} className="h-11 w-11 text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{c.name}</span>
                    {c.tags.includes("VIP") && <Crown size={14} className="shrink-0 text-amber-500" />}
                  </div>
                  <div className="truncate text-xs text-neutral-500">{c.email || c.phone}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <Badge key={t} tone={tagTone(t)}>{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/[0.05] pt-3 text-center">
                <Stat l="Visits" v={String(c.visits)} />
                <Stat l="Orders" v={String(c.orders)} />
                <Stat l="Spent" v={money(c.totalSpent, currency)} />
              </div>
              <div className="mt-2 text-center text-[11px] text-neutral-400">Last seen {timeAgo(c.lastSeen)} · via {c.source}</div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open?.name} wide>
        {open && <CustomerDetail key={open.id} c={open} reservations={reservations} orders={orders} currency={currency} onSave={(d) => save(open.id, d)} onDelete={() => del(open)} />}
      </Drawer>

      <NewCustomer open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <div className="text-sm font-semibold">{v}</div>
      <div className="text-[11px] text-neutral-400">{l}</div>
    </div>
  );
}

function CustomerDetail({ c, reservations, orders, currency, onSave, onDelete }: { c: Customer; reservations: Reservation[]; orders: Order[]; currency: string; onSave: (d: Partial<Customer>) => void; onDelete: () => void }) {
  const [tags, setTags] = useState(c.tags);
  const [notes, setNotes] = useState(c.notes);
  const [birthday, setBirthday] = useState(c.birthday);
  const [newTag, setNewTag] = useState("");
  const norm = (p: string) => p.replace(/\s+/g, "");
  const match = (email: string, phone: string) => (c.email && email.toLowerCase() === c.email.toLowerCase()) || (c.phone && norm(phone) === norm(c.phone));

  const timeline = [
    ...reservations.filter((r) => match(r.email, r.phone)).map((r) => ({ kind: "res" as const, at: r.date + "T" + r.time, r })),
    ...orders.filter((o) => match(o.email, o.phone)).map((o) => ({ kind: "ord" as const, at: o.createdAt, o })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const dirty = JSON.stringify(tags) !== JSON.stringify(c.tags) || notes !== c.notes || birthday !== c.birthday;
  const addTag = (t: string) => {
    const v = t.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setNewTag("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={c.name} className="h-16 w-16 text-lg" />
        <div className="min-w-0">
          <div className="text-xl font-semibold tracking-tight">{c.name}</div>
          <div className="text-sm text-neutral-500">Guest since {fmtDate(c.createdAt)} · via {c.source}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Visits", String(c.visits)],
          ["Orders", String(c.orders)],
          ["Total spent", money(c.totalSpent, currency)],
          ["Last seen", timeAgo(c.lastSeen)],
        ].map(([l, v]) => (
          <Card key={l} className="p-3">
            <div className="text-[11px] text-neutral-400">{l}</div>
            <div className="text-sm font-semibold">{v}</div>
          </Card>
        ))}
      </div>
      <Card className="divide-y divide-black/[0.05]">
        <a href={`tel:${c.phone}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#FAFAFB]"><Phone size={15} className="text-neutral-400" /> {c.phone || "—"}</a>
        <a href={`mailto:${c.email}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#FAFAFB]"><Mail size={15} className="text-neutral-400" /> {c.email || "—"}</a>
      </Card>

      <div>
        <div className="mb-2 text-[13px] font-medium text-neutral-700">Tags</div>
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-neutral-900 py-1 pl-3 pr-1.5 text-xs font-medium text-white">
              {t}
              <button onClick={() => setTags(tags.filter((x) => x !== t))} className="grid h-4 w-4 place-items-center rounded-full hover:bg-white/20"><X size={10} /></button>
            </span>
          ))}
          {["VIP", "Regular", "Vegetarian", "Allergy", "Birthday club"].filter((t) => !tags.includes(t)).map((t) => (
            <button key={t} onClick={() => addTag(t)} className="rounded-full border border-dashed border-black/20 px-2.5 py-1 text-xs text-neutral-500 hover:border-black/40">+ {t}</button>
          ))}
          <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag(newTag)} placeholder="Custom tag ↵" className="w-28 rounded-full border border-black/10 px-3 py-1 text-xs outline-none focus:border-[var(--accent)]" />
        </div>
      </div>
      <TextField label="Birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      <TextArea label="Private notes" hint="Only visible to staff" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferences, allergies, favourite table…" />
      <div className="flex gap-2">
        <Button variant="danger" onClick={onDelete}><Trash2 size={15} /> Remove</Button>
        <Button variant="dark" className="flex-1" disabled={!dirty} onClick={() => onSave({ tags, notes, birthday })}>Save profile</Button>
      </div>

      <div>
        <div className="mb-3 text-[13px] font-medium text-neutral-700">Timeline</div>
        {timeline.length === 0 ? (
          <p className="text-sm text-neutral-400">No bookings or orders linked yet.</p>
        ) : (
          <ol className="relative space-y-3 border-l border-black/10 pl-5">
            {timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className={cx("absolute -left-[27px] top-1 grid h-3.5 w-3.5 place-items-center rounded-full ring-4 ring-[#FBFBFD]", t.kind === "res" ? "bg-sky-500" : "bg-[var(--accent)]")} />
                {t.kind === "res" ? (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <div>
                      <div className="flex items-center gap-1.5 font-medium"><CalendarDays size={13} /> Table for {t.r.guests}</div>
                      <div className="text-xs text-neutral-500">{fmtDate(t.r.date)} · {to12h(t.r.time)}{t.r.occasion && ` · ${t.r.occasion}`}</div>
                    </div>
                    <StatusBadge status={t.r.status} />
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-medium"><ShoppingBag size={13} /> Order #{t.o.code} · {money(t.o.total, currency)}</div>
                      <div className="truncate text-xs text-neutral-500">{fmtDate(t.o.createdAt)} · {t.o.items.map((l) => l.name).join(", ")}</div>
                    </div>
                    <StatusBadge status={t.o.status} />
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function NewCustomer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState({ name: "", email: "", phone: "", birthday: "", notes: "", source: "Walk-in" });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!v.name) return toast("Name is required", "error");
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await api("/api/admin/c/customers", "POST", { ...v, tags: ["New"], visits: 0, orders: 0, totalSpent: 0, lastSeen: now });
      toast("Guest added");
      setV({ name: "", email: "", phone: "", birthday: "", notes: "", source: "Walk-in" });
      onClose();
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Drawer open={open} onClose={onClose} title="Add guest" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" loading={saving} onClick={save}>Add guest</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Full name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className="col-span-2" />
        <TextField label="Phone" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
        <TextField label="Email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        <TextField label="Birthday" type="date" value={v.birthday} onChange={(e) => setV({ ...v, birthday: e.target.value })} />
        <TextField label="Source" value={v.source} onChange={(e) => setV({ ...v, source: e.target.value })} />
        <TextArea label="Notes" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} className="col-span-2" />
      </div>
    </Drawer>
  );
}
