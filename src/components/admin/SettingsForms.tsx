"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Check, ExternalLink, Plus, RotateCcw, X, Sparkles } from "lucide-react";
import type { IntroStyle, Settings } from "@/lib/types";
import { to12h } from "@/lib/format";
import { api, Button, Card, ColorField, ImageField, Label, PageHeader, Select, TextArea, TextField, Toggle, cx, useConfirm, useToast } from "./ui";
import { useSaveSettings } from "./useSaveSettings";
import SaveBar from "./SaveBar";

export type SettingsSection = "brand" | "intro" | "contact" | "operations" | "seo" | "danger";

const KEYS: Record<Exclude<SettingsSection, "danger">, (keyof Settings)[]> = {
  brand: ["brand"],
  intro: ["intro"],
  contact: ["contact", "hours", "socials"],
  operations: ["ordering", "reservations"],
  seo: ["seo"],
};

const TITLES: Record<SettingsSection, [string, string]> = {
  brand: ["Brand & theme", "Name, voice and the colours used across your website."],
  intro: ["Intro animation", "The cinematic loader guests see when they first arrive."],
  contact: ["Contact & hours", "Where to find you and when you're open."],
  operations: ["Ordering & booking", "Online ordering fees and reservation rules."],
  seo: ["SEO", "How you appear on Google and when shared."],
  danger: ["Danger zone", "Irreversible actions."],
};

const PALETTES = [
  { name: "Terracotta", accent: "#B5532E", accentSoft: "#F4E6DC", ink: "#1D1D1F", paper: "#FAFAF7" },
  { name: "Ember", accent: "#D4572A", accentSoft: "#F2C48D", ink: "#141210", paper: "#F5F0E8" },
  { name: "Saffron", accent: "#E39B2D", accentSoft: "#F7DDA8", ink: "#1A1612", paper: "#F7F2EA" },
  { name: "Emerald", accent: "#1F7A5A", accentSoft: "#B9E0CC", ink: "#0F1513", paper: "#F1F2EC" },
  { name: "Plum", accent: "#8C2F5A", accentSoft: "#F0BFD2", ink: "#161015", paper: "#F6F0EF" },
  { name: "Indigo", accent: "#3B4BC8", accentSoft: "#C3CAF5", ink: "#0F1020", paper: "#F2F2F5" },
  { name: "Noir", accent: "#C9A46A", accentSoft: "#EAD9B8", ink: "#0B0B0B", paper: "#EFEDE8" },
];

const INTRO_STYLES: { value: IntroStyle; title: string; text: string }[] = [
  { value: "curtain", title: "Curtain", text: "Brand name rises from below, then the screen splits open like a theatre curtain." },
  { value: "counter", title: "Counter", text: "A large 0–100 loading counter with a progress line, then a smooth wipe upwards." },
  { value: "words", title: "Words", text: "Your words flash one by one in large type, ending on your brand name." },
];

export default function SettingsForm({ section, settings }: { section: SettingsSection; settings: Settings }) {
  const [title, sub] = TITLES[section];
  if (section === "danger") return (<><PageHeader title={title} subtitle={sub} /><Danger /></>);
  return <Editable section={section} settings={settings} title={title} sub={sub} />;
}

function Editable({ section, settings, title, sub }: { section: Exclude<SettingsSection, "danger">; settings: Settings; title: string; sub: string }) {
  const pick = () => Object.fromEntries(KEYS[section].map((k) => [k, settings[k]])) as Partial<Settings>;
  const [d, setD] = useState<Settings>(settings);
  const [base, setBase] = useState(JSON.stringify(pick()));
  const { save, saving } = useSaveSettings();
  const current = Object.fromEntries(KEYS[section].map((k) => [k, d[k]])) as Partial<Settings>;
  const dirty = JSON.stringify(current) !== base;
  const onSave = async () => {
    if (await save(current)) setBase(JSON.stringify(current));
  };
  const reset = () => setD({ ...d, ...JSON.parse(base) });

  return (
    <>
      <PageHeader title={title} subtitle={sub} actions={<Button variant="primary" disabled={!dirty} loading={saving} onClick={onSave}><Check size={15} /> Save</Button>} />
      <div className="max-w-4xl">
        {section === "brand" && <Brand d={d} setD={setD} />}
        {section === "intro" && <Intro d={d} setD={setD} />}
        {section === "contact" && <Contact d={d} setD={setD} />}
        {section === "operations" && <Operations d={d} setD={setD} />}
        {section === "seo" && <Seo d={d} setD={setD} />}
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={reset} />
    </>
  );
}

type P = { d: Settings; setD: (s: Settings) => void };

function Brand({ d, setD }: P) {
  const b = d.brand;
  const set = (k: keyof Settings["brand"], v: string) => setD({ ...d, brand: { ...b, [k]: v } });
  return (
    <div className="space-y-4">
      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <TextField label="Restaurant name" value={b.name} onChange={(e) => set("name", e.target.value)} />
        <TextField label="Tagline" value={b.tagline} onChange={(e) => set("tagline", e.target.value)} />
        <TextArea label="Short description" hint="Used in the footer & about" value={b.description} onChange={(e) => set("description", e.target.value)} className="sm:col-span-2" />
      </Card>
      <Card className="p-5">
        <div className="mb-3 font-semibold">Palette presets</div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PALETTES.map((p) => {
            const active = p.accent.toLowerCase() === b.accent.toLowerCase() && p.paper.toLowerCase() === b.paper.toLowerCase();
            return (
              <button key={p.name} onClick={() => setD({ ...d, brand: { ...b, accent: p.accent, accentSoft: p.accentSoft, ink: p.ink, paper: p.paper } })} className={cx("rounded-2xl border p-2 text-left transition hover:-translate-y-0.5", active ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-black/10")}>
                <div className="flex h-10 overflow-hidden rounded-lg">
                  {[p.paper, p.accentSoft, p.accent, p.ink].map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                <div className="mt-1.5 text-xs font-medium">{p.name}</div>
              </button>
            );
          })}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ColorField label="Accent" value={b.accent} onChange={(v) => set("accent", v)} />
          <ColorField label="Accent soft" value={b.accentSoft} onChange={(v) => set("accentSoft", v)} />
          <ColorField label="Ink (text & dark sections)" value={b.ink} onChange={(v) => set("ink", v)} />
          <ColorField label="Paper (background)" value={b.paper} onChange={(v) => set("paper", v)} />
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="border-b border-black/[0.06] px-5 py-3 text-sm font-semibold">Live preview</div>
        <div className="p-6 sm:p-8" style={{ background: b.paper, color: b.ink }}>
          <div className="eyebrow opacity-60">{b.tagline}</div>
          <div className="display mt-3 text-5xl">
            {b.name} <em style={{ color: b.accent }}>tonight.</em>
          </div>
          <p className="mt-3 max-w-md text-sm opacity-70">{b.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full px-5 py-2.5 text-sm font-medium" style={{ background: b.accent, color: b.paper }}>Reserve a table</span>
            <span className="rounded-full px-5 py-2.5 text-sm font-medium" style={{ background: b.ink, color: b.paper }}>View menu</span>
            <span className="rounded-full px-5 py-2.5 text-sm font-medium" style={{ background: b.accentSoft, color: b.ink }}>Offers</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Intro({ d, setD }: P) {
  const i = d.intro;
  const set = <K extends keyof Settings["intro"]>(k: K, v: Settings["intro"][K]) => setD({ ...d, intro: { ...i, [k]: v } });
  const [word, setWord] = useState("");
  return (
    <div className="space-y-4">
      <Card className="space-y-2 p-5">
        <Toggle label="Show intro animation" description="Plays before the homepage is revealed" checked={i.enabled} onChange={(v) => set("enabled", v)} />
        <div className="border-t border-black/[0.05]" />
        <Toggle label="Only once per visit" description="Skip the intro on later page views in the same session" checked={i.oncePerSession} onChange={(v) => set("oncePerSession", v)} />
      </Card>
      <Card className={cx("p-5 transition", !i.enabled && "pointer-events-none opacity-50")}>
        <div className="mb-3 font-semibold">Style</div>
        <div className="grid gap-2 sm:grid-cols-3">
          {INTRO_STYLES.map((s) => (
            <button key={s.value} onClick={() => set("style", s.value)} className={cx("relative overflow-hidden rounded-2xl border p-4 text-left transition", i.style === s.value ? "border-neutral-900 bg-ink text-white" : "border-black/10 bg-white hover:border-black/30")}>
              <IntroThumb style={s.value} active={i.style === s.value} />
              <div className="mt-3 font-medium">{s.title}</div>
              <div className={cx("mt-1 text-xs leading-relaxed", i.style === s.value ? "text-white/60" : "text-neutral-500")}>{s.text}</div>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Label hint="Shown in sequence — the last word stays">Words</Label>
          <div className="flex flex-wrap items-center gap-1.5">
            {i.words.map((w, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-mist py-1 pl-3 pr-1.5 text-sm">
                <span className="font-semibold tracking-tight">{w}</span>
                <button onClick={() => set("words", i.words.filter((_, j) => j !== idx))} className="grid h-5 w-5 place-items-center rounded-full text-neutral-400 hover:bg-black/10"><X size={11} /></button>
              </span>
            ))}
            <form onSubmit={(e) => { e.preventDefault(); if (word.trim()) { set("words", [...i.words, word.trim()]); setWord(""); } }} className="flex items-center gap-1">
              <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Add word" className="w-28 rounded-full border border-black/10 px-3 py-1 text-sm outline-none focus:border-[var(--accent)]" />
              <button className="grid h-7 w-7 place-items-center rounded-full bg-ink text-white"><Plus size={13} /></button>
            </form>
          </div>
        </div>

        <div className="mt-6">
          <Label hint={`${(i.durationMs / 1000).toFixed(1)}s`}>Duration</Label>
          <input type="range" min={1200} max={5000} step={100} value={i.durationMs} onChange={(e) => set("durationMs", Number(e.target.value))} className="w-full accent-[var(--accent)]" />
          <div className="flex justify-between text-[11px] text-neutral-400"><span>Snappy</span><span>Cinematic</span></div>
        </div>
      </Card>
      <a href="/?intro=1" target="_blank" className="inline-block">
        <Button variant="dark"><Sparkles size={15} /> Preview intro <ExternalLink size={13} /></Button>
      </a>
      <p className="text-xs text-neutral-400">Save first — the preview uses the published settings.</p>
    </div>
  );
}

function IntroThumb({ style, active }: { style: IntroStyle; active: boolean }) {
  const fg = active ? "bg-white" : "bg-ink";
  return (
    <div className={cx("relative h-20 overflow-hidden rounded-xl", active ? "bg-white/10" : "bg-mist")}>
      {style === "curtain" && (
        <>
          <motion.div className={cx("absolute inset-y-0 left-0 w-1/2", fg)} animate={{ x: ["0%", "0%", "-100%", "-100%"] }} transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.4, 0.7, 1] }} />
          <motion.div className={cx("absolute inset-y-0 right-0 w-1/2", fg)} animate={{ x: ["0%", "0%", "100%", "100%"] }} transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.4, 0.7, 1] }} />
        </>
      )}
      {style === "counter" && (
        <>
          <motion.div className={cx("absolute bottom-0 left-0 h-1", active ? "bg-[var(--accent-soft)]" : "bg-[var(--accent)]")} animate={{ width: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} />
          <div className="absolute bottom-2 right-3 font-mono text-2xl font-semibold tabular-nums">100</div>
        </>
      )}
      {style === "words" && (
        <div className="grid h-full place-items-center">
          <motion.span className="font-semibold tracking-tight text-2xl" animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }} transition={{ duration: 1.2, repeat: Infinity }}>
            Spice
          </motion.span>
        </div>
      )}
    </div>
  );
}

function Contact({ d, setD }: P) {
  const c = d.contact;
  const setC = (k: keyof Settings["contact"], v: string) => setD({ ...d, contact: { ...c, [k]: v } });
  const setS = (k: keyof Settings["socials"], v: string) => setD({ ...d, socials: { ...d.socials, [k]: v } });
  const setH = (idx: number, patch: Partial<Settings["hours"][number]>) => setD({ ...d, hours: d.hours.map((h, i) => (i === idx ? { ...h, ...patch } : h)) });
  return (
    <div className="space-y-4">
      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <TextField label="Phone" value={c.phone} onChange={(e) => setC("phone", e.target.value)} />
        <TextField label="WhatsApp number" hint="Digits with country code" value={c.whatsapp} onChange={(e) => setC("whatsapp", e.target.value)} />
        <TextField label="Email" value={c.email} onChange={(e) => setC("email", e.target.value)} className="sm:col-span-2" />
        <TextField label="Street address" value={c.address} onChange={(e) => setC("address", e.target.value)} />
        <TextField label="City & postcode" value={c.city} onChange={(e) => setC("city", e.target.value)} />
        <TextField label="Google Maps search" hint="Used for the embedded map" value={c.mapQuery} onChange={(e) => setC("mapQuery", e.target.value)} className="sm:col-span-2" />
      </Card>
      <Card className="p-5">
        <div className="mb-3 font-semibold">Opening hours</div>
        <div className="divide-y divide-black/[0.05]">
          {d.hours.map((h, i) => (
            <div key={h.day} className="flex flex-wrap items-center gap-3 py-2.5">
              <span className="w-24 text-sm font-medium">{h.day}</span>
              <Toggle checked={!h.closed} onChange={(v) => setH(i, { closed: !v, open: h.open || "12:00", close: h.close || "23:00" })} />
              {h.closed ? (
                <span className="text-sm text-neutral-400">Closed</span>
              ) : (
                <div className="flex items-center gap-2">
                  <input type="time" value={h.open} onChange={(e) => setH(i, { open: e.target.value })} className="rounded-lg border border-black/10 px-2 py-1.5 text-sm" />
                  <span className="text-neutral-400">–</span>
                  <input type="time" value={h.close} onChange={(e) => setH(i, { close: e.target.value })} className="rounded-lg border border-black/10 px-2 py-1.5 text-sm" />
                  {h.close < h.open && <span className="text-[11px] text-neutral-400">next day</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="font-semibold sm:col-span-2">Social links</div>
        {(["instagram", "facebook", "x", "youtube"] as const).map((k) => (
          <TextField key={k} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} value={d.socials[k]} onChange={(e) => setS(k, e.target.value)} />
        ))}
      </Card>
    </div>
  );
}

function Operations({ d, setD }: P) {
  const o = d.ordering;
  const r = d.reservations;
  const setO = <K extends keyof Settings["ordering"]>(k: K, v: Settings["ordering"][K]) => setD({ ...d, ordering: { ...o, [k]: v } });
  const setR = <K extends keyof Settings["reservations"]>(k: K, v: Settings["reservations"][K]) => setD({ ...d, reservations: { ...r, [k]: v } });
  const [slot, setSlot] = useState("18:30");
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-4 p-5">
        <Toggle label="Online ordering" description="Guests can order delivery & pickup" checked={o.enabled} onChange={(v) => setO("enabled", v)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Currency symbol" value={o.currency} onChange={(e) => setO("currency", e.target.value)} />
          <TextField label="Tax %" type="number" value={String(o.taxRate)} onChange={(e) => setO("taxRate", Number(e.target.value))} />
          <TextField label="Delivery fee" type="number" value={String(o.deliveryFee)} onChange={(e) => setO("deliveryFee", Number(e.target.value))} />
          <TextField label="Free delivery above" type="number" value={String(o.freeDeliveryAbove)} onChange={(e) => setO("freeDeliveryAbove", Number(e.target.value))} />
          <TextField label="Minimum order" type="number" value={String(o.minOrder)} onChange={(e) => setO("minOrder", Number(e.target.value))} />
          <TextField label="ETA (minutes)" type="number" value={String(o.etaMinutes)} onChange={(e) => setO("etaMinutes", Number(e.target.value))} />
        </div>
      </Card>
      <Card className="space-y-4 p-5">
        <Toggle label="Online reservations" description="Guests can book a table on the website" checked={r.enabled} onChange={(v) => setR("enabled", v)} />
        <Select label="Max party size online" value={String(r.maxGuests)} onChange={(e) => setR("maxGuests", Number(e.target.value))} options={Array.from({ length: 30 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} />
        <div>
          <Label hint="Tap to remove">Time slots</Label>
          <div className="flex flex-wrap gap-1.5">
            {[...r.slots].sort().map((s) => (
              <button key={s} onClick={() => setR("slots", r.slots.filter((x) => x !== s))} className="group inline-flex items-center gap-1 rounded-full bg-mist px-3 py-1.5 text-xs font-medium hover:bg-red-50 hover:text-red-600">
                {to12h(s)} <X size={11} className="opacity-40 group-hover:opacity-100" />
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input type="time" value={slot} onChange={(e) => setSlot(e.target.value)} className="rounded-xl border border-black/10 px-3 py-2 text-sm" />
            <Button size="sm" className="h-auto" onClick={() => !r.slots.includes(slot) && setR("slots", [...r.slots, slot].sort())}><Plus size={14} /> Add slot</Button>
          </div>
        </div>
        <TextArea label="Booking note" rows={3} value={r.note} onChange={(e) => setR("note", e.target.value)} />
      </Card>
    </div>
  );
}

function Seo({ d, setD }: P) {
  const s = d.seo;
  const set = (k: keyof Settings["seo"], v: string) => setD({ ...d, seo: { ...s, [k]: v } });
  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5">
        <TextField label="Page title" hint={`${s.title.length}/60`} value={s.title} onChange={(e) => set("title", e.target.value)} />
        <TextArea label="Meta description" hint={`${s.description.length}/160`} rows={3} value={s.description} onChange={(e) => set("description", e.target.value)} />
        <ImageField label="Social share image" value={s.ogImage} onChange={(v) => set("ogImage", v)} />
      </Card>
      <Card className="p-5">
        <div className="mb-3 text-sm font-semibold">Google preview</div>
        <div className="max-w-xl">
          <div className="text-xs text-neutral-500">noor.kitchen</div>
          <div className="truncate text-lg text-[#1a0dab]">{s.title}</div>
          <div className="line-clamp-2 text-sm text-neutral-600">{s.description}</div>
        </div>
      </Card>
    </div>
  );
}

function Danger() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  async function reset() {
    if (!(await confirm("Reset ALL data to the demo content? Every booking, order, guest and edit will be lost."))) return;
    setBusy(true);
    try {
      await api("/api/admin/reset", "POST");
      toast("Demo data restored");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="max-w-2xl border-red-200 p-5">
      <div className="flex gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-500"><AlertTriangle size={18} /></span>
        <div className="flex-1">
          <div className="font-semibold">Reset demo data</div>
          <p className="mt-1 text-sm text-neutral-500">Restores the original menu, content, settings and sample CRM records. Useful before showing the demo to a new client.</p>
          <Button variant="danger" className="mt-4" loading={busy} onClick={reset}><RotateCcw size={15} /> Reset everything</Button>
        </div>
      </div>
    </Card>
  );
}
