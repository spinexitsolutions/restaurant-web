"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { FadeUp, RevealText, SectionLabel } from "../motion";

export function PostCard({ p, i = 0, large = false }: { p: Post; i?: number; large?: boolean }) {
  return (
    <FadeUp delay={i * 0.08}>
      <Link href={`/journal/${p.slug}`} className="group block" data-cursor="Read">
        <div className={`overflow-hidden rounded-[24px] ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
          <img src={p.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105" />
        </div>
        <div className="mt-5 flex items-center gap-3 text-[12px] text-muted">
          <span className="eyebrow">{p.tags[0]}</span>
          <span className="h-px w-5 bg-line" />
          <span>{fmtDate(p.date)}</span>
        </div>
        <h3 className={`display mt-2 flex items-start justify-between gap-4 ${large ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl"}`}>
          <span className="decoration-1 underline-offset-[6px] group-hover:underline">{p.title}</span>
          <ArrowUpRight className="mt-2 shrink-0 transition-transform group-hover:rotate-45" size={22} />
        </h3>
        <p className="mt-2 max-w-xl text-muted">{p.excerpt}</p>
      </Link>
    </FadeUp>
  );
}

export default function Journal({ posts }: { posts: Post[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-28 sm:px-10 sm:py-36">
      <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <SectionLabel index="09" className="mb-8 text-muted">
            Journal
          </SectionLabel>
          <RevealText as="h2" text="Notes from the kitchen." className="display block text-[13vw] sm:text-7xl lg:text-8xl" />
        </div>
        <Link href="/journal" className="group flex items-center gap-2 text-muted hover:text-ink">
          All stories <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
        </Link>
      </div>
      <div className="grid gap-10 md:grid-cols-3 md:gap-6">
        {posts.slice(0, 3).map((p, i) => (
          <PostCard key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
