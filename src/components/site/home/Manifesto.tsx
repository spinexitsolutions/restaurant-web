"use client";

import { useSite } from "../providers";
import { ScrubText } from "../motion";

/** Apple-style manifesto: one centred paragraph that lights up as you scroll. */
export default function Manifesto() {
  const s = useSite();
  return (
    <section className="mx-auto max-w-[1100px] px-6 py-32 sm:py-48">
      <p className="mb-8 text-center text-[17px] font-semibold text-accent">Our philosophy</p>
      <ScrubText text={s.manifesto} className="display text-center text-[32px] leading-[1.15] sm:text-[52px] lg:text-[60px]" />
    </section>
  );
}
