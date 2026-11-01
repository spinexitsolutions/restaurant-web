"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Check, Loader2, Plus } from "lucide-react";
import clsx from "clsx";
import type { Faq } from "@/lib/types";
import { Field } from "./ReserveWizard";
import { EASE } from "./motion";
import Btn from "./Button";

const SUBJECTS = ["General enquiry", "Private dining", "Feedback", "Press", "Careers"];

export default function ContactForm({ initialSubject }: { initialSubject?: string }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: initialSubject || SUBJECTS[0], message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [err, setErr] = useState("");
  return (
    <div className="rounded-[30px] bg-cream p-5 ring-1 ring-ink/5 sm:p-10">
      <AnimatePresence mode="wait">
        {state === "done" ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[440px] flex-col items-center justify-center text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-accent text-paper"><Check size={36} /></span>
            <h3 className="display mt-6 text-[34px]">Message received.</h3>
            <p className="mt-3 text-muted">We reply to everything within a day.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0 }}
            onSubmit={async (e) => {
              e.preventDefault();
              setState("loading");
              setErr("");
              const r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
              if (r.ok) setState("done");
              else {
                setErr((await r.json()).error);
                setState("idle");
              }
            }}
          >
            <div className="mb-6 flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button type="button" key={s} onClick={() => setF({ ...f, subject: s })} className={clsx("h-10 rounded-full px-4 text-[14px] transition", f.subject === s ? "bg-ink text-paper" : "bg-paper ring-1 ring-ink/10 hover:ring-ink/40")}>
                  {s}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" required value={f.name} onChange={(v) => setF({ ...f, name: v })} autoComplete="name" />
              <Field label="Email" required type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} autoComplete="email" />
              <Field label="Phone (optional)" type="tel" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} className="sm:col-span-2" />
            </div>
            <textarea required rows={5} placeholder="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="mt-3 w-full rounded-[18px] bg-paper p-4 text-[16px] outline-none ring-1 ring-ink/10 placeholder:text-muted focus:ring-ink/40" />
            {err && <p className="mt-2 text-[14px] text-red-600">{err}</p>}
            <Btn type="submit" disabled={state === "loading"} className="mt-5" icon={state === "loading" ? <Loader2 className="animate-spin" size={18} /> : undefined}>
              Send message
            </Btn>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <ul className="border-t border-line">
      {faqs.map((f) => {
        const on = open === f.id;
        return (
          <li key={f.id} className="border-b border-line">
            <button onClick={() => setOpen(on ? null : f.id)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
              <span className="display text-[24px] sm:text-[28px]">{f.q}</span>
              <motion.span animate={{ rotate: on ? 45 : 0 }} transition={{ ease: EASE }} className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors", on ? "bg-accent text-paper" : "bg-ink/5")}>
                <Plus size={18} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                  <p className="max-w-2xl pb-6 text-[17px] text-muted">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
