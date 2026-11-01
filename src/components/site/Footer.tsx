"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useSite } from "./providers";
import { Socials } from "./Navbar";
import { to12h } from "@/lib/format";
import { EASE } from "./motion";

export default function Footer() {
  const s = useSite();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["0.1em", "-0.04em"]);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-mist text-ink">
      <div className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-10 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="eyebrow mb-4 text-muted">The Noor letter</div>
            <h3 className="display mb-6 max-w-md text-[24px] sm:text-[28px]">
              Seasonal menus and secret suppers. <em>First dibs, in your inbox.</em>
            </h3>
            <Newsletter dark={false} />
          </div>
          <div>
            <div className="eyebrow mb-4 text-muted">Explore</div>
            <ul className="space-y-2 text-ink/80">
              {[
                ["/menu", "Menu"],
                ["/reserve", "Reservations"],
                ["/order", "Order online"],
                ["/events", "Experiences"],
                ["/gallery", "Gallery"],
                ["/journal", "Journal"],
                ["/about", "Our story"],
                ["/contact", "Contact & FAQ"],
              ].map(([h, l]) => (
                <li key={h}>
                  <Link href={h} className="transition hover:text-accent">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4 text-muted">Hours</div>
            <ul className="space-y-1.5 text-[14px] text-ink/80">
              {s.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span className="text-muted">{h.day.slice(0, 3)}</span>
                  <span className="tabular-nums">{h.closed ? "Closed" : `${to12h(h.open)} – ${to12h(h.close)}`}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4 text-muted">Find us</div>
            <address className="not-italic text-ink/80">
              {s.contact.address}
              <br />
              {s.contact.city}
            </address>
            <a href={`tel:${s.contact.phone}`} className="mt-3 block text-ink/80 hover:text-ink">{s.contact.phone}</a>
            <a href={`mailto:${s.contact.email}`} className="block text-ink/80 hover:text-ink">{s.contact.email}</a>
            <Socials className="mt-5" />
          </div>
        </div>
      </div>

      <motion.div style={{ y, letterSpacing }} className="display pointer-events-none select-none whitespace-nowrap px-2 pt-16 text-center text-[30vw] leading-[0.8] text-ink/[0.07]">
        {s.brand.name}
        <span>.</span>
      </motion.div>

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-2 border-t border-ink/10 px-5 py-6 text-[12px] text-muted sm:flex-row sm:justify-between sm:px-10">
        <span>© {new Date().getFullYear()} {s.brand.name}. All rights reserved.</span>
        <span>Crafted with fire in {s.contact.city.split(" ")[0]}.</span>
      </div>
    </footer>
  );
}

export function Newsletter({ dark = true }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setState("loading");
        const r = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        const j = await r.json();
        if (r.ok) {
          setState("done");
          setEmail("");
        } else {
          setState("error");
          setMsg(j.error);
        }
      }}
      className={`relative flex max-w-md items-center rounded-full p-1.5 ring-1 ${dark ? "bg-white/5 ring-white/15" : "bg-white ring-ink/10"}`}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setState("idle");
        }}
        placeholder="you@email.com"
        className="h-11 flex-1 bg-transparent px-4 text-[15px] outline-none placeholder:opacity-50"
      />
      <motion.button
        whileTap={{ scale: 0.94 }}
        disabled={state === "loading"}
        className="grid h-11 min-w-11 place-items-center rounded-full bg-accent px-4 text-white"
        aria-label="Subscribe"
      >
        {state === "done" ? (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ease: EASE }} className="flex items-center gap-1 text-sm">
            <Check size={16} /> Subscribed
          </motion.span>
        ) : (
          <ArrowRight size={18} />
        )}
      </motion.button>
      {state === "error" && <p className="absolute -bottom-6 left-4 text-[12px] text-red-400">{msg}</p>}
    </form>
  );
}
