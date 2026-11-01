"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSite } from "../providers";
import { FadeUp, ParallaxImage, RevealText, SectionLabel } from "../motion";

export default function Story() {
  const s = useSite();
  const st = s.story;
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-28 sm:px-10 sm:py-40">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <ParallaxImage src={st.image} alt="Our kitchen" className="aspect-[4/5] w-full rounded-[28px] sm:aspect-[5/6]" strength={10} />
          </div>
        </div>
        <div className="flex flex-col justify-center lg:col-span-5">
          <SectionLabel index="03" className="mb-8 text-muted">
            {st.eyebrow}
          </SectionLabel>
          <RevealText as="h2" text={st.title} className="display block text-[13vw] sm:text-7xl lg:text-[5.4vw]" />
          <FadeUp delay={0.2}>
            <p className="mt-8 text-[18px] leading-relaxed text-muted text-pretty">{st.body}</p>
          </FadeUp>
          <FadeUp delay={0.3} className="mt-10 flex items-center gap-5">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[15px] font-semibold uppercase tracking-[0.12em]">{st.signature}</span>
          </FadeUp>
          <FadeUp delay={0.35} className="mt-12 grid grid-cols-[1fr_auto] items-end gap-6">
            <ParallaxImage src={st.imageAlt} alt="" className="aspect-[4/3] rounded-[22px]" strength={14} />
            <Link href="/about" className="group grid h-28 w-28 place-items-center rounded-full border border-line text-center text-[13px] transition-colors hover:bg-ink hover:text-paper">
              <span>
                Read the
                <br />
                full story
                <ArrowUpRight size={16} className="mx-auto mt-1 transition-transform group-hover:rotate-45" />
              </span>
            </Link>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
