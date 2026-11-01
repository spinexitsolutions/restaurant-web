"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { Eye, EyeOff, GripVertical, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import type { HomeSection, Settings } from "@/lib/types";
import { Button, Card, ImageField, PageHeader, TextArea, TextField, Toggle, cx } from "./ui";
import { useSaveSettings } from "./useSaveSettings";
import SaveBar from "./SaveBar";

type Draft = Pick<Settings, "sections" | "hero" | "manifesto" | "story" | "stats" | "announcement">;

export default function HomepageEditor({ settings }: { settings: Settings }) {
  const initial: Draft = { sections: settings.sections, hero: settings.hero, manifesto: settings.manifesto, story: settings.story, stats: settings.stats, announcement: settings.announcement };
  const [d, setD] = useState<Draft>(initial);
  const [base, setBase] = useState(JSON.stringify(initial));
  const { save, saving } = useSaveSettings();
  const dirty = JSON.stringify(d) !== base;

  const hero = (k: keyof Settings["hero"], v: unknown) => setD({ ...d, hero: { ...d.hero, [k]: v } });
  const story = (k: keyof Settings["story"], v: string) => setD({ ...d, story: { ...d.story, [k]: v } });
  const moveSection = (i: number, dir: -1 | 1) => {
    const arr = [...d.sections];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setD({ ...d, sections: arr });
  };

  async function onSave() {
    if (await save(d, "Homepage published")) setBase(JSON.stringify(d));
  }

  return (
    <>
      <PageHeader
        title="Homepage"
        subtitle="Arrange sections and edit every word on your homepage."
        actions={
          <>
            <a href="/" target="_blank"><Button><ExternalLink size={15} /> Preview</Button></a>
            <Button variant="primary" disabled={!dirty} loading={saving} onClick={onSave}>Publish changes</Button>
          </>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-1 font-semibold">Sections</div>
            <p className="mb-4 text-xs text-neutral-500">Drag (or use arrows) to reorder. Toggle the eye to hide a section.</p>
            <Reorder.Group axis="y" values={d.sections} onReorder={(s) => setD({ ...d, sections: s })} className="space-y-1.5">
              {d.sections.map((s, i) => (
                <SectionRow
                  key={s.id}
                  s={s}
                  first={i === 0}
                  last={i === d.sections.length - 1}
                  onMove={(dir) => moveSection(i, dir)}
                  onToggle={() => setD({ ...d, sections: d.sections.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)) })}
                />
              ))}
            </Reorder.Group>
          </Card>
          <Card className="space-y-3 p-5">
            <Toggle label="Announcement bar" description="Thin banner above the navigation" checked={d.announcement.enabled} onChange={(v) => setD({ ...d, announcement: { ...d.announcement, enabled: v } })} />
            <TextField label="Text" value={d.announcement.text} onChange={(e) => setD({ ...d, announcement: { ...d.announcement, text: e.target.value } })} />
            <TextField label="Link" value={d.announcement.link} onChange={(e) => setD({ ...d, announcement: { ...d.announcement, link: e.target.value } })} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 font-semibold">Hero</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Eyebrow" value={d.hero.eyebrow} onChange={(e) => hero("eyebrow", e.target.value)} className="sm:col-span-2" />
              <TextField label="Headline" value={d.hero.title} onChange={(e) => hero("title", e.target.value)} />
              <TextField label="Headline accent (italic)" value={d.hero.titleAccent} onChange={(e) => hero("titleAccent", e.target.value)} />
              <TextArea label="Subtitle" rows={3} value={d.hero.subtitle} onChange={(e) => hero("subtitle", e.target.value)} className="sm:col-span-2" />
              <TextField label="Primary button" value={d.hero.ctaPrimary} onChange={(e) => hero("ctaPrimary", e.target.value)} />
              <TextField label="Secondary button" value={d.hero.ctaSecondary} onChange={(e) => hero("ctaSecondary", e.target.value)} />
              <div className="sm:col-span-2"><ImageField label="Background image" value={d.hero.image} onChange={(v) => hero("image", v)} /></div>
              <TextField label="Marquee words" hint="Comma separated" value={d.hero.marquee.join(", ")} onChange={(e) => hero("marquee", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} className="sm:col-span-2" />
            </div>
            {/* live preview */}
            <div className="relative mt-5 overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {d.hero.image && <img src={d.hero.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
              <div className="relative">
                <div className="eyebrow text-white/60">{d.hero.eyebrow}</div>
                <div className="display mt-3 text-4xl">{d.hero.title} <em className="text-[var(--accent-soft)]">{d.hero.titleAccent}</em></div>
                <p className="mt-3 max-w-md text-sm text-white/70">{d.hero.subtitle}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 font-semibold">Manifesto</div>
            <TextArea label="Scroll-reveal statement" hint="Lights up word by word as visitors scroll" rows={4} value={d.manifesto} onChange={(e) => setD({ ...d, manifesto: e.target.value })} />
          </Card>

          <Card className="p-5">
            <div className="mb-4 font-semibold">Our story</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Eyebrow" value={d.story.eyebrow} onChange={(e) => story("eyebrow", e.target.value)} />
              <TextField label="Title" value={d.story.title} onChange={(e) => story("title", e.target.value)} />
              <TextArea label="Body" rows={5} value={d.story.body} onChange={(e) => story("body", e.target.value)} className="sm:col-span-2" />
              <TextField label="Signature" value={d.story.signature} onChange={(e) => story("signature", e.target.value)} className="sm:col-span-2" />
              <ImageField label="Main image" value={d.story.image} onChange={(v) => story("image", v)} />
              <ImageField label="Secondary image" value={d.story.imageAlt} onChange={(v) => story("imageAlt", v)} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold">Numbers</div>
              <Button size="sm" onClick={() => setD({ ...d, stats: [...d.stats, { label: "New stat", value: 0, suffix: "" }] })}><Plus size={14} /> Add</Button>
            </div>
            <div className="space-y-2">
              {d.stats.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_60px_36px] items-end gap-2">
                  <TextField label={i === 0 ? "Label" : undefined} value={s.label} onChange={(e) => setD({ ...d, stats: d.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                  <TextField label={i === 0 ? "Value" : undefined} type="number" value={String(s.value)} onChange={(e) => setD({ ...d, stats: d.stats.map((x, j) => (j === i ? { ...x, value: Number(e.target.value) } : x)) })} />
                  <TextField label={i === 0 ? "Suffix" : undefined} value={s.suffix} onChange={(e) => setD({ ...d, stats: d.stats.map((x, j) => (j === i ? { ...x, suffix: e.target.value } : x)) })} />
                  <button onClick={() => setD({ ...d, stats: d.stats.filter((_, j) => j !== i) })} className="grid h-[42px] w-9 place-items-center rounded-xl text-neutral-400 hover:bg-red-50 hover:text-red-500" aria-label="Remove"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={() => setD(JSON.parse(base))} />
    </>
  );
}

function SectionRow({ s, first, last, onMove, onToggle }: { s: HomeSection; first: boolean; last: boolean; onMove: (d: -1 | 1) => void; onToggle: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={s} dragListener={false} dragControls={controls} className={cx("flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-2 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)]", !s.visible && "opacity-50")}>
      <button onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none p-1 text-neutral-300 active:cursor-grabbing" aria-label="Drag">
        <GripVertical size={16} />
      </button>
      <span className="flex-1 text-sm font-medium">{s.label}</span>
      <button disabled={first} onClick={() => onMove(-1)} className="grid h-7 w-7 place-items-center rounded-full text-neutral-400 hover:bg-black/5 disabled:opacity-20" aria-label="Up"><ArrowUp size={13} /></button>
      <button disabled={last} onClick={() => onMove(1)} className="grid h-7 w-7 place-items-center rounded-full text-neutral-400 hover:bg-black/5 disabled:opacity-20" aria-label="Down"><ArrowDown size={13} /></button>
      <button onClick={onToggle} className={cx("grid h-7 w-7 place-items-center rounded-full", s.visible ? "text-neutral-700 hover:bg-black/5" : "text-neutral-300 hover:bg-black/5")} aria-label="Toggle visibility">
        {s.visible ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
    </Reorder.Item>
  );
}
