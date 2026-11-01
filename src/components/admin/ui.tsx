"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Loader2, Upload, X, AlertTriangle, ImageIcon } from "lucide-react";
import clsx from "clsx";

export const cx = clsx;

/* ───────── fetch helper ───────── */
export async function api<T = unknown>(url: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = Array.isArray(v) ? v.join("; ") : String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ───────── Toasts ───────── */
type Toast = { id: number; text: string; tone: "ok" | "error" };
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cx(
                "pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg shadow-black/10",
                t.tone === "ok" ? "bg-ink/90 text-white backdrop-blur-xl" : "bg-red-600 text-white"
              )}
            >
              {t.tone === "ok" ? <CircleCheck size={16} /> : <AlertTriangle size={16} />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ───────── Primitives ───────── */
export function Button({
  variant = "secondary",
  size = "md",
  loading,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
  size?: "sm" | "md";
  loading?: boolean;
}) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      style={variant === "dark" ? ({ "--ab-fill": "var(--accent)" } as React.CSSProperties) : undefined}
      className={cx(
        "inline-flex select-none items-center justify-center gap-1.5 rounded-full font-medium tracking-[-0.01em] transition-[transform,color,box-shadow] duration-300 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 px-3.5 text-[13px]" : "h-10 px-5 text-sm",
        variant === "primary" && "abtn bg-[var(--accent)] text-white shadow-[0_6px_16px_-8px_var(--accent)]",
        variant === "dark" && "abtn bg-ink text-white",
        variant === "secondary" && "abtn bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.07)] hover:text-white",
        variant === "ghost" && "text-ink/70 hover:bg-ink/[0.05] hover:text-ink",
        variant === "danger" && "bg-red-50 text-red-600 hover:bg-red-100",
        className
      )}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cx("rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_-14px_rgba(0,0,0,0.12)]", className)}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: string; subtitle?: string; actions?: React.ReactNode; eyebrow?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {eyebrow && <p className="mb-1.5 text-[14px] font-semibold text-[var(--accent)]">{eyebrow}</p>}
        <h1 className="text-[32px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[44px]">{title}</h1>
        {subtitle && <p className="mt-2 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: string; className?: string }) {
  const tones: Record<string, string> = {
    neutral: "bg-neutral-100 text-neutral-600",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
    red: "bg-red-50 text-red-600",
    accent: "bg-[color-mix(in_oklab,var(--accent)_12%,white)] text-[var(--accent)]",
    dark: "bg-ink text-white",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", tones[tone] || tones.neutral, className)}>
      {children}
    </span>
  );
}

export const STATUS_TONE: Record<string, string> = {
  pending: "amber",
  confirmed: "blue",
  seated: "violet",
  completed: "green",
  cancelled: "red",
  "no-show": "neutral",
  new: "accent",
  preparing: "amber",
  ready: "blue",
  "out-for-delivery": "violet",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] || "neutral"}>{status.replace(/-/g, " ")}</Badge>;
}

const inputCls =
  "w-full rounded-[14px] border border-black/[0.08] bg-white px-4 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-neutral-400 hover:border-black/15 focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_oklab,var(--accent)_14%,transparent)]";
export const inputClass = inputCls;

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium text-neutral-700">
      {children}
      {hint && <span className="text-[11px] font-normal text-neutral-400">{hint}</span>}
    </span>
  );
}

export function TextField({ label, hint, className, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <label className={cx("block", className)}>
      {label && <Label hint={hint}>{label}</Label>}
      <input {...rest} className={inputCls} />
    </label>
  );
}

export function TextArea({ label, hint, className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }) {
  return (
    <label className={cx("block", className)}>
      {label && <Label hint={hint}>{label}</Label>}
      <textarea rows={4} {...rest} className={cx(inputCls, "resize-y leading-relaxed")} />
    </label>
  );
}

export function Select({
  label,
  options,
  className,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }) {
  return (
    <label className={cx("block", className)}>
      {label && <Label>{label}</Label>}
      <select {...rest} className={cx(inputCls, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23888%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_12px_center] bg-no-repeat pr-9")}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string }) {
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cx("relative inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-full transition-colors", checked ? "bg-[var(--accent)]" : "bg-black/[0.12]")}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 35 }} className={cx("h-[22px] w-[22px] rounded-full bg-white shadow", checked ? "ml-[20px]" : "ml-[2px]")} />
    </button>
  );
  if (!label) return sw;
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <div className="text-sm font-medium text-neutral-800">{label}</div>
        {description && <div className="text-xs text-neutral-500">{description}</div>}
      </div>
      {sw}
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white p-1.5 pr-3">
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-black/10" style={{ background: value }}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </span>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent font-mono text-sm uppercase outline-none" />
      </div>
    </label>
  );
}

export function ImageField({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  async function upload(f: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
      toast("Image uploaded");
    } catch (e) {
      toast((e as Error).message || "Upload failed", "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      {label && <Label hint="Paste a URL or upload">{label}</Label>}
      <div className="flex gap-3">
        <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl border border-black/10 bg-neutral-100">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-neutral-300">
              <ImageIcon size={22} />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://images.unsplash.com/…" className={inputCls} />
          <div className="flex gap-2">
            <Button type="button" size="sm" loading={busy} onClick={() => ref.current?.click()}>
              <Upload size={14} /> Upload
            </Button>
            {value && (
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
                Remove
              </Button>
            )}
          </div>
          <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
      </div>
    </div>
  );
}

/* ───────── Overlays ───────── */
export function Drawer({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className={cx("absolute inset-y-0 right-0 flex w-full flex-col bg-paper shadow-2xl sm:inset-y-3 sm:right-3 sm:rounded-[28px] sm:overflow-hidden", wide ? "sm:max-w-2xl" : "sm:max-w-lg")}
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:px-6">
              <div className="min-w-0 truncate text-lg font-semibold tracking-tight">{title}</div>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-black/5 text-neutral-600 hover:bg-black/10" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] bg-white px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

type ConfirmState = { text: string; resolve: (v: boolean) => void } | null;
const ConfirmCtx = createContext<(text: string) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>(null);
  const ask = useCallback((text: string) => new Promise<boolean>((resolve) => setState({ text, resolve })), []);
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      <AnimatePresence>
        {state && (
          <div className="fixed inset-0 z-[90] grid place-items-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => close(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
            >
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle size={22} />
              </div>
              <p className="text-[15px] font-medium text-neutral-800">{state.text}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button onClick={() => close(false)}>Cancel</Button>
                <Button variant="dark" className="!bg-red-600 hover:!bg-red-700" onClick={() => close(true)}>
                  Confirm
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmCtx.Provider>
  );
}

export function Empty({ icon, title, text }: { icon?: React.ReactNode; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-black/10 bg-white/70 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-neutral-300">{icon}</div>}
      <div className="font-medium text-neutral-700">{title}</div>
      {text && <div className="mt-1 max-w-xs text-sm text-neutral-500">{text}</div>}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, layoutId }: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; layoutId: string }) {
  return (
    <div className="no-scrollbar inline-flex max-w-full overflow-x-auto rounded-full bg-black/[0.05] p-1">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={cx("relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors", value === o.value ? "text-ink" : "text-neutral-500 hover:text-neutral-800")}>
          {value === o.value && <motion.span layoutId={layoutId} transition={{ type: "spring", stiffness: 500, damping: 38 }} className="absolute inset-0 rounded-full bg-white shadow-sm" />}
          <span className="relative z-10 flex items-center gap-1.5">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-64">
      <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cx(inputCls, "rounded-full py-2 pl-9")} />
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = [...name].reduce((h, c) => h + c.charCodeAt(0), 0) % 360;
  return (
    <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold", className)} style={{ background: `hsl(${hue} 70% 92%)`, color: `hsl(${hue} 45% 32%)` }}>
      {initials}
    </span>
  );
}
