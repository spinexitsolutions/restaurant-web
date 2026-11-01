"use client";

import { useSite } from "../providers";
import { Counter, FadeUp } from "../motion";

export default function Stats() {
  const s = useSite();
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-10 sm:pb-32">
      <div className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
        {s.stats.map((st, i) => (
          <FadeUp key={i} delay={i * 0.08} className={`border-b border-line py-8 pr-4 lg:border-b-0 ${i % 2 === 0 ? "border-r lg:border-r" : "lg:border-r"} ${i === s.stats.length - 1 ? "lg:border-r-0" : ""} pl-0 sm:pl-6 first:pl-0`}>
            <Counter value={st.value} suffix={st.suffix} className="display block text-[16vw] leading-none sm:text-7xl lg:text-8xl" />
            <div className="eyebrow mt-3 text-muted">{st.label}</div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
