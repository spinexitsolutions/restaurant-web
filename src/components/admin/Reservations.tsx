"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Plus, Trash2, Phone, Mail, Users, Clock, List, LayoutGrid, Sparkles } from "lucide-react";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { fmtDate, to12h, timeAgo } from "@/lib/format";
import { api, Avatar, Badge, Button, Card, Drawer, Empty, PageHeader, SearchInput, Segmented, Select, StatusBadge, TextArea, TextField, useConfirm, useToast, cx, STATUS_TONE } from "./ui";

const STATUSES: ReservationStatus[] = ["pending", "confirmed", "seated", "completed", "cancelled", "no-show"];
type Range = "today" | "upcoming" | "past" | "all";

const blank = (): Omit<Reservation, "id" | "createdAt"> => ({
  name: "",
  email: "",
  phone: "",
  date: new Date().toISOString().slice(0, 10),
  time: "20:00",
  guests: 2,
  occasion: "",
  notes: "",
  status: "confirmed",
  table: "",
});

export default function Reservations({ reservations, slots, maxGuests }: { reservations: Reservation[]; slots: string[]; maxGuests: number }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [view, setView] = useState<"list" | "timeline">("list");
  const [range, setRange] = useState<Range>("upcoming");
  const [status, setStatus] = useState<"all" | ReservationStatus>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(blank());
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return reservations
      .filter((r) => {
        if (range === "today" && r.date !== today) return false;
        if (range === "upcoming" && r.date < today) return false;
        if (range === "past" && r.date >= today) return false;
        if (status !== "all" && r.status !== status) return false;
        if (q) {
          const s = q.toLowerCase();
          return [r.name, r.email, r.phone, r.occasion, r.table].some((v) => v.toLowerCase().includes(s));
        }
        return true;
      })
      .sort((a, b) => (range === "past" ? (b.date + b.time).localeCompare(a.date + a.time) : (a.date + a.time).localeCompare(b.date + b.time)));
  }, [reservations, range, status, q, today]);

  const open = reservations.find((r) => r.id === openId) || null;

  async function patch(id: string, data: Partial<Reservation>, msg = "Reservation updated") {
    try {
      await api(`/api/admin/c/reservations/${id}`, "PATCH", data);
      toast(msg);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  async function del(id: string) {
    if (!(await confirm("Delete this reservation? This can't be undone."))) return;
    await api(`/api/admin/c/reservations/${id}`, "DELETE");
    setOpenId(null);
    toast("Reservation deleted");
    router.refresh();
  }

  async function create() {
    if (!draft.name || !draft.phone) return toast("Name and phone are required", "error");
    setSaving(true);
    try {
      await api(`/api/admin/c/reservations`, "POST", draft);
      toast("Reservation added");
      setCreating(false);
      setDraft(blank());
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  const todays = reservations.filter((r) => r.date === today && r.status !== "cancelled");
  const counts = {
    today: todays.length,
    covers: todays.reduce((s, r) => s + r.guests, 0),
    pending: reservations.filter((r) => r.status === "pending").length,
  };

  const timeline = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    todays.sort((a, b) => a.time.localeCompare(b.time)).forEach((r) => map.set(r.time, [...(map.get(r.time) || []), r]));
    return [...map.entries()];
  }, [todays]);

  return (
    <>
      <PageHeader
        title="Reservations"
        subtitle={`${counts.today} bookings · ${counts.covers} covers today · ${counts.pending} pending`}
        actions={
          <>
            <Segmented layoutId="res-view" value={view} onChange={setView} options={[{ value: "list", label: <><List size={14} /> List</> }, { value: "timeline", label: <><LayoutGrid size={14} /> Today</> }]} />
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus size={16} /> New booking
            </Button>
          </>
        }
      />

      {view === "list" ? (
        <>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Segmented layoutId="res-range" value={range} onChange={setRange} options={(["today", "upcoming", "past", "all"] as Range[]).map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))} />
            <div className="flex gap-2">
              <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} options={[{ value: "all", label: "All statuses" }, ...STATUSES.map((s) => ({ value: s, label: s }))]} className="w-40" />
              <SearchInput value={q} onChange={setQ} placeholder="Search guests…" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <Empty icon={<CalendarDays size={32} />} title="No reservations here" text="Try another filter or add a booking manually." />
          ) : (
            <Card className="overflow-hidden">
              <div className="hidden grid-cols-[1.6fr_1fr_0.6fr_0.7fr_1fr_40px] gap-4 border-b border-black/[0.06] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 md:grid">
                <span>Guest</span>
                <span>When</span>
                <span>Party</span>
                <span>Table</span>
                <span>Status</span>
                <span />
              </div>
              <motion.div layout className="divide-y divide-black/[0.05]">
                <AnimatePresence initial={false}>
                  {filtered.map((r) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setOpenId(r.id)}
                      className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-paper md:grid-cols-[1.6fr_1fr_0.6fr_0.7fr_1fr_40px] md:gap-4 md:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={r.name} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{r.name}</div>
                          <div className="truncate text-xs text-neutral-500">
                            {r.phone}
                            {r.occasion && <span className="text-[var(--accent)]"> · {r.occasion}</span>}
                          </div>
                          <div className="mt-0.5 text-xs text-neutral-500 md:hidden">
                            {r.date === today ? "Today" : fmtDate(r.date, { day: "numeric", month: "short" })} · {to12h(r.time)} · {r.guests} guests
                          </div>
                        </div>
                      </div>
                      <div className="hidden text-sm md:block">
                        <div className="font-medium">{r.date === today ? "Today" : fmtDate(r.date, { weekday: "short", day: "numeric", month: "short" })}</div>
                        <div className="text-xs text-neutral-500">{to12h(r.time)}</div>
                      </div>
                      <div className="hidden items-center gap-1 text-sm md:flex">
                        <Users size={14} className="text-neutral-400" /> {r.guests}
                      </div>
                      <div className="hidden md:block" onClick={(e) => e.stopPropagation()}>
                        <input
                          defaultValue={r.table}
                          placeholder="—"
                          onBlur={(e) => e.target.value !== r.table && patch(r.id, { table: e.target.value }, "Table assigned")}
                          className="w-16 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm hover:border-black/10 focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <StatusSelect value={r.status} onChange={(s) => patch(r.id, { status: s }, `Marked ${s}`)} />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); del(r.id); }} className="hidden h-8 w-8 place-items-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-500 md:grid" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </Card>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {timeline.length === 0 && <Empty icon={<Sparkles size={32} />} title="A quiet day" text="No bookings for today yet." />}
          {timeline.map(([time, rs]) => (
            <div key={time} className="grid grid-cols-[64px_1fr] gap-3 sm:grid-cols-[88px_1fr]">
              <div className="pt-3 text-right">
                <div className="text-sm font-semibold">{to12h(time)}</div>
                <div className="text-xs text-neutral-400">{rs.reduce((s, r) => s + r.guests, 0)} covers</div>
              </div>
              <div className="relative grid gap-2 border-l-2 border-[var(--accent)]/20 pl-3 sm:grid-cols-2 xl:grid-cols-3">
                {rs.map((r) => (
                  <Card key={r.id} onClick={() => setOpenId(r.id)} className="cursor-pointer p-3.5 transition hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-medium">{r.name}</div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><Users size={12} /> {r.guests}</span>
                      {r.table && <span>Table {r.table}</span>}
                      {r.occasion && <span className="text-[var(--accent)]">{r.occasion}</span>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.name}
        footer={
          open && (
            <>
              <Button variant="danger" onClick={() => del(open.id)} className="mr-auto">
                <Trash2 size={15} /> Delete
              </Button>
              {open.status === "pending" && (
                <Button variant="primary" onClick={() => patch(open.id, { status: "confirmed" }, "Booking confirmed")}>
                  Confirm booking
                </Button>
              )}
              {open.status === "confirmed" && (
                <Button variant="dark" onClick={() => patch(open.id, { status: "seated" }, "Guests seated")}>
                  Mark seated
                </Button>
              )}
              {open.status === "seated" && (
                <Button variant="dark" onClick={() => patch(open.id, { status: "completed" }, "Visit completed")}>
                  Complete
                </Button>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-2">
              <InfoTile icon={<CalendarDays size={15} />} label="Date" value={fmtDate(open.date, { weekday: "short", day: "numeric", month: "short" })} />
              <InfoTile icon={<Clock size={15} />} label="Time" value={to12h(open.time)} />
              <InfoTile icon={<Users size={15} />} label="Guests" value={String(open.guests)} />
            </div>
            <Card className="divide-y divide-black/[0.05]">
              <a href={`tel:${open.phone}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-paper"><Phone size={15} className="text-neutral-400" /> {open.phone || "—"}</a>
              <a href={`mailto:${open.email}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-paper"><Mail size={15} className="text-neutral-400" /> {open.email || "—"}</a>
            </Card>
            <div>
              <div className="mb-2 text-[13px] font-medium text-neutral-700">Status</div>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => patch(open.id, { status: s }, `Marked ${s}`)} className={cx("rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition", open.status === s ? "border-neutral-900 bg-ink text-white" : "border-black/10 bg-white text-neutral-600 hover:border-black/30")}>
                    {s.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
            <EditableFields key={open.id} r={open} onSave={(d) => patch(open.id, d, "Saved")} slots={slots} maxGuests={maxGuests} />
            <p className="text-xs text-neutral-400">Booked {timeAgo(open.createdAt)}</p>
          </div>
        )}
      </Drawer>

      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        title="New reservation"
        footer={
          <>
            <Button onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={create}>Add booking</Button>
          </>
        }
      >
        <ResForm value={draft} onChange={setDraft} slots={slots} maxGuests={maxGuests} />
      </Drawer>
    </>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">{icon} {label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </Card>
  );
}

function StatusSelect({ value, onChange }: { value: ReservationStatus; onChange: (s: ReservationStatus) => void }) {
  return (
    <div className="relative inline-block">
      <select value={value} onChange={(e) => onChange(e.target.value as ReservationStatus)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Status">
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <Badge tone={STATUS_TONE[value]} className="pointer-events-none !py-1 !text-xs">
        {value.replace("-", " ")} <span className="opacity-50">▾</span>
      </Badge>
    </div>
  );
}

function EditableFields({ r, onSave, slots, maxGuests }: { r: Reservation; onSave: (d: Partial<Reservation>) => void; slots: string[]; maxGuests: number }) {
  const [v, setV] = useState<Omit<Reservation, "id" | "createdAt">>(r);
  const dirty = (["date", "time", "guests", "table", "occasion", "notes", "name", "email", "phone"] as const).some((k) => v[k] !== r[k]);
  return (
    <div className="space-y-4">
      <ResForm value={v} onChange={setV} slots={slots} maxGuests={maxGuests} hideStatus />
      {dirty && (
        <Button variant="dark" className="w-full" onClick={() => onSave({ date: v.date, time: v.time, guests: v.guests, table: v.table, occasion: v.occasion, notes: v.notes, name: v.name, email: v.email, phone: v.phone })}>
          Save changes
        </Button>
      )}
    </div>
  );
}

function ResForm<T extends Omit<Reservation, "id" | "createdAt">>({ value, onChange, slots, maxGuests, hideStatus }: { value: T; onChange: (v: T) => void; slots: string[]; maxGuests: number; hideStatus?: boolean }) {
  const set = <K extends keyof T>(k: K, val: T[K]) => onChange({ ...value, [k]: val });
  const allSlots = slots.includes(value.time) ? slots : [value.time, ...slots];
  return (
    <div className="grid grid-cols-2 gap-3">
      <TextField label="Guest name" value={value.name} onChange={(e) => set("name", e.target.value as T["name"])} className="col-span-2" />
      <TextField label="Phone" value={value.phone} onChange={(e) => set("phone", e.target.value as T["phone"])} />
      <TextField label="Email" type="email" value={value.email} onChange={(e) => set("email", e.target.value as T["email"])} />
      <TextField label="Date" type="date" value={value.date} onChange={(e) => set("date", e.target.value as T["date"])} />
      <Select label="Time" value={value.time} onChange={(e) => set("time", e.target.value as T["time"])} options={allSlots.map((s) => ({ value: s, label: to12h(s) }))} />
      <Select label="Guests" value={String(value.guests)} onChange={(e) => set("guests", Number(e.target.value) as T["guests"])} options={Array.from({ length: Math.max(maxGuests, value.guests) }, (_, i) => ({ value: String(i + 1), label: `${i + 1} ${i ? "guests" : "guest"}` }))} />
      <TextField label="Table" value={value.table} placeholder="e.g. T4" onChange={(e) => set("table", e.target.value as T["table"])} />
      <TextField label="Occasion" value={value.occasion} placeholder="Birthday, anniversary…" onChange={(e) => set("occasion", e.target.value as T["occasion"])} className={hideStatus ? "col-span-2" : ""} />
      {!hideStatus && <Select label="Status" value={value.status} onChange={(e) => set("status", e.target.value as T["status"])} options={STATUSES.map((s) => ({ value: s, label: s }))} />}
      <TextArea label="Notes" rows={3} value={value.notes} onChange={(e) => set("notes", e.target.value as T["notes"])} className="col-span-2" />
    </div>
  );
}
