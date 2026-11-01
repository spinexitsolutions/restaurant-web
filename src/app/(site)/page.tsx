import { readDb } from "@/lib/db";
import Hero from "@/components/site/home/Hero";
import Manifesto from "@/components/site/home/Manifesto";
import Signatures from "@/components/site/home/Signatures";
import Story from "@/components/site/home/Story";
import Stats from "@/components/site/home/Stats";
import MenuPreview from "@/components/site/home/MenuPreview";
import Experiences from "@/components/site/home/Experiences";
import Gallery from "@/components/site/home/Gallery";
import Offers from "@/components/site/home/Offers";
import Testimonials from "@/components/site/home/Testimonials";
import Journal from "@/components/site/home/Journal";
import ReserveCta from "@/components/site/home/ReserveCta";
import Visit from "@/components/site/home/Visit";
import type { HomeSectionId } from "@/lib/types";

export default async function Home() {
  const db = await readDb();
  const s = db.settings;
  const items = [...db.menuItems].sort((a, b) => a.order - b.order);
  const featured = items.filter((m) => m.featured && m.available);
  const categories = [...db.categories].sort((a, b) => a.order - b.order);
  const events = db.events.filter((e) => e.published).sort((a, b) => a.date.localeCompare(b.date));
  const posts = db.posts.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date));
  const gallery = [...db.gallery].sort((a, b) => a.order - b.order);
  const offers = db.offers.filter((o) => o.active);

  const render: Record<HomeSectionId, () => React.ReactNode> = {
    hero: () => <Hero />,
    manifesto: () => <Manifesto />,
    signatures: () => (featured.length ? <Signatures items={featured} /> : null),
    story: () => <Story />,
    stats: () => (s.stats.length ? <Stats /> : null),
    menu: () => <MenuPreview categories={categories} items={items.filter((i) => i.available)} />,
    experiences: () => (events.length ? <Experiences events={events.slice(0, 3)} /> : null),
    gallery: () => (gallery.length ? <Gallery images={gallery} /> : null),
    offers: () => (offers.length ? <Offers offers={offers} /> : null),
    testimonials: () => (db.testimonials.length ? <Testimonials items={db.testimonials} /> : null),
    journal: () => (posts.length ? <Journal posts={posts} /> : null),
    reserve: () => (s.reservations.enabled ? <ReserveCta /> : null),
    visit: () => <Visit />,
  };

  return (
    <>
      {s.sections
        .filter((sec) => sec.visible && render[sec.id])
        .map((sec) => (
          <div key={sec.id} id={sec.id}>
            {render[sec.id]()}
          </div>
        ))}
    </>
  );
}
