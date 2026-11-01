import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { readDb } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { FadeUp, ParallaxImage } from "@/components/site/motion";
import { PostCard } from "@/components/site/home/Journal";
import PageHeader from "@/components/site/PageHeader";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = (await readDb()).posts.find((x) => x.slug === slug);
  return { title: p?.title || "Journal", description: p?.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await readDb();
  const post = db.posts.find((p) => p.slug === slug && p.published);
  if (!post) notFound();
  const more = db.posts.filter((p) => p.published && p.id !== post.id).slice(0, 2);
  const blocks = post.content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const words = post.content.split(/\s+/).length;

  return (
    <article>
      <PageHeader eyebrow={`${post.tags.join(" · ")} — ${fmtDate(post.date)}`} title={post.title}>
        <div className="flex items-center gap-3 text-[14px] text-muted">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper">{post.author[0]}</span>
          <span>
            <span className="block text-ink">{post.author}</span>
            {Math.max(1, Math.round(words / 200))} min read
          </span>
        </div>
      </PageHeader>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <ParallaxImage src={post.cover} alt="" className="aspect-[16/10] w-full rounded-[30px] sm:aspect-[21/9]" strength={8} />
      </div>
      <div className="mx-auto max-w-[680px] px-5 py-20 sm:py-28">
        <p className="display mb-10 text-[24px] leading-snug sm:text-4xl">{post.excerpt}</p>
        {blocks.map((b, i) =>
          b.startsWith("## ") ? (
            <FadeUp key={i}>
              <h2 className="display mb-4 mt-12 text-[28px] sm:text-[34px]">{b.slice(3)}</h2>
            </FadeUp>
          ) : (
            <FadeUp key={i}>
              <p className={`mb-6 text-[18px] leading-[1.75] text-ink/80 ${i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-[family-name:var(--font-display)] first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-accent" : ""}`}>{b}</p>
            </FadeUp>
          )
        )}
        <Link href="/journal" className="mt-10 inline-flex items-center gap-2 text-[14px] text-muted hover:text-ink">
          <ArrowLeft size={16} /> All stories
        </Link>
      </div>
      {more.length > 0 && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-10">
            <div className="eyebrow mb-10 text-muted">Keep reading</div>
            <div className="grid gap-10 md:grid-cols-2 md:gap-8">
              {more.map((p, i) => <PostCard key={p.id} p={p} i={i} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
