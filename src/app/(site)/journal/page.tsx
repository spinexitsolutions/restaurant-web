import { readDb } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import { PostCard } from "@/components/site/home/Journal";

export const metadata = { title: "Journal" };

export default async function JournalPage() {
  const db = await readDb();
  const posts = db.posts.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date));
  const [first, ...rest] = posts;
  return (
    <>
      <PageHeader eyebrow="Journal" title="Notes from" accent="the kitchen." intro="Recipes, stories and the occasional strong opinion about butter." />
      <div className="mx-auto max-w-[1400px] px-5 pb-32 sm:px-10">
        {first && <PostCard p={first} large />}
        <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-8">
          {rest.map((p, i) => (
            <PostCard key={p.id} p={p} i={i} />
          ))}
        </div>
        {!posts.length && <p className="py-20 text-center text-muted">Stories coming soon.</p>}
      </div>
    </>
  );
}
