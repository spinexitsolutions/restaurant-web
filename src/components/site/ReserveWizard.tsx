"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, Clock, Loader2, Users } from "lucide-react";
import clsx from "clsx";
import { useSite } from "./providers";
import { EASE } from "./motion";
import { fmtDate, to12h } from "@/lib/format";

type Step = 0 | 1 | 2 | 3 | 4;
const STEPS = ["Guests", "Date", "Time", "Details"];
const OCCASIONS = ["Birthday", "Anniversary", "Date night", "Business", "Celebration"];

export default function ReserveWizard({ image, initial }: { image: string; initial: { date?: string; time?: string; guests?: string; occasion?: string } }) {
  const s = useSite();
  const r = s.reservations;
  const days = useMemo(() => {
    const out: { iso: string; d: Date; closed: boolean }[] = [];
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (let i = 0; i < 45; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      const h = s.hours.find((x) => x.day === names[d.getDay()]);
      out.push({ iso, d, closed: !!h?.closed });
    }
    return out;
  }, [s.hours]);

  const [step, setStep] = useState<Step>(initial.date && initial.time ? 3 : initial.guests ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [guests, setGuests] = useState(Math.min(r.maxGuests, Number(initial.guests) || 2));
  const [date, setDate] = useState(initial.date && days.some((d) => d.iso === initial.date) ? initial.date : days.find((d) => !d.closed)?.iso || "");
  const [time, setTime] = useState(initial.time && r.slots.includes(initial.time) ? initial.time : "");
  const [form, setForm] = useState({ name: "", phone: "", email: "", occasion: initial.occasion || "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const go = (n: Step) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const isToday = date === days[0]?.iso;
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const slotOk = (t: string) => {
    if (!isToday) return true;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m > nowMin + 30;
  };

  async function submit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, date, time, guests }),
    });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) return setError(j.error || "Something went wrong.");
    go(4);
  }

  const ics = useMemo(() => {
    if (!date || !time) return "";
    const start = date.replace(/-/g, "") + "T" + time.replace(":", "") + "00";
    const [h, m] = time.split(":").map(Number);
    const end = date.replace(/-/g, "") + "T" + String((h + 2) % 24).padStart(2, "0") + String(m).padStart(2, "0") + "00";
    const body = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:Dinner at ${s.brand.name}\nLOCATION:${s.contact.address}, ${s.contact.city}\nEND:VEVENT\nEND:VCALENDAR`;
    return "data:text/calendar;charset=utf8," + encodeURIComponent(body);
  }, [date, time, s]);

  if (!r.enabled) {
    return (
      <div className="mx-auto max-w-xl px-5 pb-32 text-center text-muted">
        Online reservations are paused right now. Call us on <a className="text-ink underline" href={`tel:${s.contact.phone}`}>{s.contact.phone}</a>.
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-32 sm:px-10 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-h-[560px] rounded-[30px] bg-cream p-5 ring-1 ring-ink/5 sm:p-10">
        {step < 4 && (
          <div className="mb-10 flex items-center gap-2">
            {STEPS.map((l, i) => (
              <button
                key={l}
                disabled={i > step}
                onClick={() => go(i as Step)}
                className="group flex flex-1 flex-col gap-2 text-left disabled:cursor-default"
              >
                <span className="h-1 overflow-hidden rounded-full bg-ink/10">
                  <motion.span className="block h-full bg-accent" animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.6, ease: EASE }} />
                </span>
                <span className={clsx("eyebrow text-[10px]", i <= step ? "text-ink" : "text-muted")}>{l}</span>
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: dir * -40, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {step === 0 && (
              <div>
                <h2 className="display text-5xl sm:text-6xl">How many of you?</h2>
                <div className="mt-10 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {Array.from({ length: r.maxGuests }, (_, i) => i + 1).map((n) => (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      key={n}
                      onClick={() => {
                        setGuests(n);
                        go(1);
                      }}
                      className={clsx("display grid aspect-square place-items-center rounded-[20px] text-4xl transition-colors", guests === n ? "bg-ink text-paper" : "bg-paper ring-1 ring-ink/10 hover:ring-ink/40")}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>
                <p className="mt-6 text-[14px] text-muted">{r.note}</p>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="display text-5xl sm:text-6xl">Pick a day.</h2>
                <div className="mt-10 grid grid-cols-4 gap-2 sm:grid-cols-7" data-lenis-prevent>
                  {days.map((d) => (
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      key={d.iso}
                      disabled={d.closed}
                      onClick={() => {
                        setDate(d.iso);
                        setTime("");
                        go(2);
                      }}
                      className={clsx(
                        "flex flex-col items-center rounded-[18px] py-3 transition-colors disabled:opacity-30",
                        date === d.iso ? "bg-ink text-paper" : "bg-paper ring-1 ring-ink/10 hover:ring-ink/40"
                      )}
                    >
                      <span className="eyebrow text-[9px] opacity-60">{d.d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                      <span className="display text-3xl">{d.d.getDate()}</span>
                      <span className="text-[11px] opacity-60">{d.closed ? "Closed" : d.d.toLocaleDateString("en-IN", { month: "short" })}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="display text-5xl sm:text-6xl">What time?</h2>
                <p className="mt-2 text-muted">{fmtDate(date, { weekday: "long", day: "numeric", month: "long" })}</p>
                {["Lunch", "Dinner"].map((label) => {
                  const list = r.slots.filter((t) => (label === "Lunch" ? Number(t.slice(0, 2)) < 17 : Number(t.slice(0, 2)) >= 17));
                  if (!list.length) return null;
                  return (
                    <div key={label} className="mt-8">
                      <div className="eyebrow mb-3 text-muted">{label}</div>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {list.map((t) => (
                          <motion.button
                            whileTap={{ scale: 0.94 }}
                            key={t}
                            disabled={!slotOk(t)}
                            onClick={() => {
                              setTime(t);
                              go(3);
                            }}
                            className={clsx("h-14 rounded-full text-[15px] tabular-nums transition-colors disabled:opacity-30", time === t ? "bg-ink text-paper" : "bg-paper ring-1 ring-ink/10 hover:ring-ink/40")}
                          >
                            {to12h(t)}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <h2 className="display text-5xl sm:text-6xl">Almost there.</h2>
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  <Field label="Full name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" />
                  <Field label="Phone" required type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" />
                  <Field label="Email (for confirmation)" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" className="sm:col-span-2" />
                </div>
                <div className="mt-6">
                  <div className="eyebrow mb-3 text-muted">Occasion</div>
                  <div className="flex flex-wrap gap-2">
                    {[...OCCASIONS, ...(form.occasion && !OCCASIONS.includes(form.occasion) ? [form.occasion] : [])].map((o) => (
                      <button
                        type="button"
                        key={o}
                        onClick={() => setForm({ ...form, occasion: form.occasion === o ? "" : o })}
                        className={clsx("h-10 rounded-full px-4 text-[14px] transition", form.occasion === o ? "bg-accent text-paper" : "bg-paper ring-1 ring-ink/10 hover:ring-ink/40")}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="mt-6 block">
                  <span className="eyebrow mb-2 block text-muted">Notes, allergies, requests</span>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-[18px] bg-paper p-4 text-[15px] outline-none ring-1 ring-ink/10 focus:ring-ink/40" />
                </label>
                {error && <p className="mt-4 text-[14px] text-red-600">{error}</p>}
                <div className="mt-8 flex items-center justify-between">
                  <button type="button" onClick={() => go(2)} className="flex items-center gap-2 text-[14px] text-muted hover:text-ink">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <motion.button whileTap={{ scale: 0.96 }} disabled={loading} className="flex h-14 items-center gap-2 rounded-full bg-ink px-7 font-medium text-paper hover:bg-accent">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Confirm booking <ArrowRight size={18} /></>}
                  </motion.button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="grid h-24 w-24 place-items-center rounded-full bg-accent text-paper"
                >
                  <Check size={44} strokeWidth={2.4} />
                </motion.div>
                <h2 className="display mt-8 text-5xl sm:text-7xl">See you soon, {form.name.split(" ")[0]}.</h2>
                <p className="mt-4 max-w-md text-muted">
                  Your request for {guests} on {fmtDate(date, { weekday: "long", day: "numeric", month: "long" })} at {to12h(time)} is in. We&apos;ll confirm by phone{form.email ? " and email" : ""} shortly.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <a href={ics} download="noor-reservation.ics" className="flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[14px] text-paper">
                    <CalendarPlus size={16} /> Add to calendar
                  </a>
                  <a href="/menu" className="flex h-12 items-center rounded-full px-5 text-[14px] ring-1 ring-ink/15">Preview the menu</a>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* live summary */}
      <aside className="relative hidden overflow-hidden rounded-[30px] bg-ink text-paper lg:block">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-8">
          <div className="eyebrow mb-4 text-paper/60">Your table</div>
          <ul className="space-y-3 text-[17px]">
            <Summary icon={<Users size={16} />} label={`${guests} ${guests === 1 ? "guest" : "guests"}`} />
            <Summary icon={<CalendarPlus size={16} />} label={date ? fmtDate(date, { weekday: "short", day: "numeric", month: "long" }) : "—"} />
            <Summary icon={<Clock size={16} />} label={time ? to12h(time) : "Choose a time"} />
          </ul>
          <p className="mt-6 border-t border-white/15 pt-5 text-[13px] text-paper/60">{s.contact.address}, {s.contact.city}</p>
        </div>
      </aside>
    </div>
  );
}

function Summary({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10">{icon}</span>
      <AnimatePresence mode="wait">
        <motion.span key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
          {label}
        </motion.span>
      </AnimatePresence>
    </li>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  className,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
}) {
  return (
    <label className={clsx("group relative block", className)}>
      <input
        type={type}
        required={required}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer h-16 w-full rounded-[18px] bg-paper px-4 pt-5 text-[16px] outline-none ring-1 ring-ink/10 transition focus:ring-ink/40"
      />
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-muted transition-all peer-focus:top-4 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px]">
        {label}
        {required && " *"}
      </span>
    </label>
  );
}
