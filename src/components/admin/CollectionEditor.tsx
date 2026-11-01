"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ImageIcon, LayoutGrid, List, Pencil, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { slugify } from "@/lib/format";
import { SCHEMAS, type Ctx, type Field } from "./schemas";
import { api, Button, Card, ColorField, Drawer, Empty, ImageField, Label, PageHeader, SearchInput, Segmented, Select, TextArea, TextField, Toggle, cx, useConfirm, useToast } from "./ui";

type Row = Record<string, unknown> & { id: string };

export default function CollectionEditor({ collection, items, categories, currency }: { collection: string; items: Row[]; categories: Category[]; currency: string }) {
  const cfg = SCHEMAS[collection];
  const ctx: Ctx = { categories, currency };
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">(cfg.layout);
  const [editing, setEditing] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [groupFilter, setGroupFilter] = useState("All");

  const sorted = useMemo(() => {
    const arr = [...items];
    if (cfg.orderable) arr.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
    return arr;
  }, [items, cfg.orderable]);

  const groups = useMemo(() => (cfg.groupBy ? ["All", ...Array.from(new Set(sorted.map((r) => cfg.groupBy!(r, ctx))))] : []), [sorted, cfg]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = sorted.filter((r) => {
    if (cfg.groupBy && groupFilter !== "All" && cfg.groupBy(r, ctx) !== groupFilter) return false;
    if (!q) return true;
    return JSON.stringify(r).toLowerCase().includes(q.toLowerCase());
  });

  function startNew() {
    const maxOrder = Math.max(0, ...items.map((i) => Number(i.order ?? 0)));
    setEditing({ id: "", ...cfg.defaults(ctx), ...(cfg.orderable ? { order: maxOrder + 1 } : {}) } as Row);
    setIsNew(true);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const { id, ...data } = editing;
      if (cfg.slugFrom && !data.slug) data.slug = slugify(String(data[cfg.slugFrom] || ""));
      if (isNew) await api(`/api/admin/c/${collection}`, "POST", data);
      else await api(`/api/admin/c/${collection}/${id}`, "PATCH", data);
      toast(isNew ? `New ${cfg.singular} added` : "Changes saved");
      setEditing(null);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function del(r: Row) {
    if (!(await confirm(`Delete this ${cfg.singular}?`))) return;
    await api(`/api/admin/c/${collection}/${r.id}`, "DELETE");
    toast("Deleted");
    setEditing(null);
    router.refresh();
  }

  async function quickToggle(r: Row, key: string) {
    try {
      await api(`/api/admin/c/${collection}/${r.id}`, "PATCH", { [key]: !r[key] });
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  async function move(r: Row, dir: -1 | 1) {
    const idx = sorted.findIndex((x) => x.id === r.id);
    const other = sorted[idx + dir];
    if (!other) return;
    // normalise order to index-based values, then swap
    const updates = sorted.map((x, i) => ({ id: x.id, order: i + 1 }));
    updates[idx].order = idx + dir + 1;
    updates[idx + dir].order = idx + 1;
    const changed = updates.filter((u) => Number(sorted.find((s) => s.id === u.id)!.order) !== u.order);
    await Promise.all(changed.map((u) => api(`/api/admin/c/${collection}/${u.id}`, "PATCH", { order: u.order })));
    router.refresh();
  }

  const title = (r: Row) => String(r[cfg.primary] || `Untitled ${cfg.singular}`);
  const img = (r: Row) => (cfg.image ? String(r[cfg.image] || "") : "");

  return (
    <>
      <PageHeader
        title={cfg.title}
        subtitle={cfg.description}
        actions={
          <>
            <SearchInput value={q} onChange={setQ} />
            {cfg.image && <Segmented layoutId={`lay-${collection}`} value={layout} onChange={setLayout} options={[{ value: "grid", label: <LayoutGrid size={14} /> }, { value: "list", label: <List size={14} /> }]} />}
            <Button variant="primary" onClick={startNew}>
              <Plus size={16} /> Add {cfg.singular}
            </Button>
          </>
        }
      />

      {groups.length > 0 && (
        <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
          {groups.map((g) => (
            <button key={g} onClick={() => setGroupFilter(g)} className={cx("whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition", groupFilter === g ? "border-neutral-900 bg-ink text-white" : "border-black/10 bg-white text-neutral-600 hover:border-black/30")}>
              {g}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Empty title={`No ${cfg.title.toLowerCase()} yet`} text={`Add your first ${cfg.singular} to get started.`} />
      ) : layout === "grid" && cfg.image ? (
        <motion.div layout className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {filtered.map((r) => (
              <motion.div key={r.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 34 }}>
                <Card className="group overflow-hidden">
                  <button onClick={() => { setEditing(r); setIsNew(false); }} className="relative block aspect-[4/3] w-full overflow-hidden bg-neutral-100 text-left">
                    {img(r) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img(r)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center text-neutral-300"><ImageIcon size={28} /></div>
                    )}
                    {cfg.toggles?.some((t) => !r[t.key]) && <div className="absolute inset-0 bg-white/50" />}
                    <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100"><Pencil size={14} /></span>
                    {Array.isArray(r.tags) && r.tags.length > 0 && (
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {(r.tags as string[]).slice(0, 3).map((t) => (
                          <span key={t} className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur">{t}</span>
                        ))}
                      </div>
                    )}
                  </button>
                  <div className="p-3.5">
                    <div className="truncate font-medium">{title(r)}</div>
                    {cfg.secondary && <div className="truncate text-xs text-neutral-500">{cfg.secondary(r, ctx)}</div>}
                    <CardControls r={r} cfgToggles={cfg.toggles} orderable={cfg.orderable && !q && groupFilter === "All"} onToggle={quickToggle} onMove={move} onDelete={del} first={sorted[0]?.id === r.id} last={sorted[sorted.length - 1]?.id === r.id} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Card className="divide-y divide-black/[0.05] overflow-hidden">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
              {cfg.image && (
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {img(r) && <img src={img(r)} alt="" className="h-full w-full object-cover" />}
                </div>
              )}
              <button onClick={() => { setEditing(r); setIsNew(false); }} className="min-w-0 flex-1 text-left">
                <div className="truncate text-sm font-medium">{title(r)}</div>
                {cfg.secondary && <div className="truncate text-xs text-neutral-500">{cfg.secondary(r, ctx)}</div>}
              </button>
              <div className="shrink-0">
                <CardControls r={r} cfgToggles={cfg.toggles} orderable={cfg.orderable && !q && groupFilter === "All"} onToggle={quickToggle} onMove={move} onDelete={del} first={sorted[0]?.id === r.id} last={sorted[sorted.length - 1]?.id === r.id} inline onEdit={() => { setEditing(r); setIsNew(false); }} />
              </div>
            </div>
          ))}
        </Card>
      )}

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title={isNew ? `New ${cfg.singular}` : editing ? title(editing) : ""}
        wide={collection === "posts"}
        footer={
          <>
            {!isNew && editing && (
              <Button variant="danger" className="mr-auto" onClick={() => del(editing)}><Trash2 size={15} /> Delete</Button>
            )}
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={save}><Check size={15} /> {isNew ? "Create" : "Save"}</Button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            {cfg.fields.map((f) => (
              <div key={f.key} className={cx(f.full || f.type === "textarea" || f.type === "image" ? "col-span-2" : "col-span-2 sm:col-span-1")}>
                <FieldInput
                  field={f}
                  value={editing[f.key]}
                  ctx={ctx}
                  onChange={(v) => {
                    const next = { ...editing, [f.key]: v } as Row;
                    if (cfg.slugFrom === f.key && (isNew || !editing.slug)) next.slug = slugify(String(v));
                    setEditing(next);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </>
  );
}

function CardControls({ r, cfgToggles, orderable, onToggle, onMove, onDelete, first, last, inline, onEdit }: {
  r: Row;
  cfgToggles?: { key: string; label: string }[];
  orderable?: boolean;
  onToggle: (r: Row, k: string) => void;
  onMove: (r: Row, d: -1 | 1) => void;
  onDelete: (r: Row) => void;
  first: boolean;
  last: boolean;
  inline?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className={cx("flex items-center gap-1", !inline && "mt-3 justify-between border-t border-black/[0.05] pt-3")}>
      <div className="flex flex-wrap items-center gap-1">
        {cfgToggles?.map((t) => (
          <button key={t.key} onClick={() => onToggle(r, t.key)} className={cx("rounded-full px-2.5 py-1 text-[11px] font-medium transition", r[t.key] ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-400 line-through")}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center">
        {orderable && (
          <>
            <IconBtn disabled={first} onClick={() => onMove(r, -1)} label="Move up"><ArrowUp size={14} /></IconBtn>
            <IconBtn disabled={last} onClick={() => onMove(r, 1)} label="Move down"><ArrowDown size={14} /></IconBtn>
          </>
        )}
        {onEdit && <IconBtn onClick={onEdit} label="Edit"><Pencil size={14} /></IconBtn>}
        <IconBtn onClick={() => onDelete(r)} label="Delete" danger><Trash2 size={14} /></IconBtn>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, disabled, label, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; label: string; danger?: boolean }) {
  return (
    <button aria-label={label} title={label} disabled={disabled} onClick={onClick} className={cx("grid h-8 w-8 place-items-center rounded-full text-neutral-400 transition disabled:opacity-25", danger ? "hover:bg-red-50 hover:text-red-500" : "hover:bg-black/5 hover:text-neutral-800")}>
      {children}
    </button>
  );
}

export function FieldInput({ field: f, value, onChange, ctx }: { field: Field; value: unknown; onChange: (v: unknown) => void; ctx: Ctx }) {
  switch (f.type) {
    case "textarea":
      return <TextArea label={f.label} hint={f.hint} rows={f.rows || 4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} className={f.rows && f.rows > 8 ? "[&_textarea]:font-mono [&_textarea]:text-[13px]" : ""} />;
    case "number":
      return <TextField label={f.label} hint={f.hint} type="number" inputMode="decimal" value={String(value ?? 0)} onChange={(e) => onChange(Number(e.target.value))} />;
    case "toggle":
      return (
        <div className="rounded-xl border border-black/10 bg-white px-3.5 py-2">
          <Toggle label={f.label} checked={!!value} onChange={onChange} />
        </div>
      );
    case "select":
      return <Select label={f.label} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} options={f.options?.(ctx) || []} />;
    case "image":
      return <ImageField label={f.label} value={String(value ?? "")} onChange={onChange} />;
    case "color":
      return <ColorField label={f.label} value={String(value || "#000000")} onChange={onChange} />;
    case "tags":
      return <TextField label={f.label} hint={f.hint} value={Array.isArray(value) ? value.join(", ") : String(value ?? "")} onChange={(e) => onChange(e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} />;
    case "multiselect": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <Label>{f.label}</Label>
          <div className="flex flex-wrap gap-1.5">
            {(f.options?.(ctx) || []).map((o) => {
              const on = arr.includes(o.value);
              return (
                <button type="button" key={o.value} onClick={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])} className={cx("rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition", on ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-black/10 bg-white text-neutral-500 hover:border-black/30")}>
                  {on && <Check size={11} className="mr-1 inline" />}
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    case "date":
    case "time":
      return <TextField label={f.label} type={f.type} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    default:
      return <TextField label={f.label} hint={f.hint} placeholder={f.placeholder} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
}
