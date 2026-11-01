"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Navigation } from "lucide-react";
import clsx from "clsx";
import { useSite } from "../providers";
import { FadeUp, RevealText, SectionLabel } from "../motion";
import { openStatus, to12h } from "@/lib/format";
import { Whatsapp } from "../icons";

export default function Visit() {
  const s = useSite();
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const [today, setToday] = useState("");
  useEffect(() => {
    setStatus(openStatus(s.hours));
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long" }));
  }, [s.hours]);
  const q = encodeURIComponent(s.contact.mapQuery || `${s.contact.address} ${s.contact.city}`);

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-28 sm:px-10 sm:py-36">
      <SectionLabel index="11" className="mb-8 text-muted">
        Visit
      </SectionLabel>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <RevealText as="h2" text="Come say hello." className="display block text-[14vw] sm:text-7xl lg:text-8xl" />
          <FadeUp delay={0.1} className="mt-10 space-y-8">
            {status && (
              <div className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-[14px]">
                <span className={clsx("pulse-dot h-2 w-2 rounded-full", status.open ? "bg-emerald-500 text-emerald-500" : "bg-ink/30 text-ink/30")} />
                {status.open ? "Open now" : "Closed"} · {status.label}
              </div>
            )}
            <div className="flex gap-4">
              <MapPin className="mt-1 shrink-0 text-accent" size={20} />
              <p className="text-xl">{s.contact.address}<br />{s.contact.city}</p>
            </div>
            <ul className="max-w-sm divide-y divide-line border-y border-line">
              {s.hours.map((h) => (
                <li key={h.day} className={clsx("flex justify-between py-2.5 text-[15px]", h.day === today && "font-medium text-accent")}>
                  <span>{h.day}</span>
                  <span className="tabular-nums">{h.closed ? "Closed" : `${to12h(h.open)} – ${to12h(h.close)}`}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noreferrer" className="flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[14px] text-paper">
                <Navigation size={16} /> Directions
              </a>
              <a href={`tel:${s.contact.phone}`} className="flex h-12 items-center gap-2 rounded-full border border-ink/15 px-5 text-[14px]">
                <Phone size={16} /> Call
              </a>
              {s.contact.whatsapp && (
                <a href={`https://wa.me/${s.contact.whatsapp}`} target="_blank" rel="noreferrer" className="flex h-12 items-center gap-2 rounded-full border border-ink/15 px-5 text-[14px]">
                  <Whatsapp width={16} height={16} /> WhatsApp
                </a>
              )}
            </div>
          </FadeUp>
        </div>
        <FadeUp delay={0.2} className="relative min-h-[420px] overflow-hidden rounded-[28px] bg-ink/5">
          <iframe
            title="Map"
            src={`https://maps.google.com/maps?q=${q}&z=15&output=embed`}
            className="absolute inset-0 h-full w-full grayscale-[0.85] contrast-[1.05] sepia-[0.2]"
            loading="lazy"
          />
        </FadeUp>
      </div>
    </section>
  );
}
