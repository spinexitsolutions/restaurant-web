import { readDb } from "@/lib/db";
import { SiteProviders } from "@/components/site/providers";
import Intro from "@/components/site/Intro";
import { shouldSkipIntroScript } from "@/lib/intro";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import CartDrawer from "@/components/site/CartDrawer";
import Cursor from "@/components/site/Cursor";
import { IMG } from "@/lib/seed";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const db = await readDb();
  const s = db.settings;
  const featured = db.menuItems.filter((m) => m.featured).map((m) => m.image);
  const previews = [
    s.hero.image,
    featured[0] || IMG.curries,
    IMG.diningRoom,
    featured[1] || IMG.biryani,
    db.events[0]?.image || IMG.platedDark,
    db.gallery[0]?.image || IMG.barInterior,
    db.posts[0]?.cover || IMG.flameChef,
    s.story.image,
    IMG.terrace,
  ];
  const introImages = [...featured.slice(0, 6), s.hero.image];
  return (
    <SiteProviders settings={s} initialIntro={s.intro.enabled}>
      {s.intro.enabled && <script dangerouslySetInnerHTML={{ __html: shouldSkipIntroScript(s.intro.oncePerSession) }} />}
      {s.intro.enabled && <Intro images={introImages} />}
      <div className="grain">
        <Navbar previews={previews} />
        <main className="relative">{children}</main>
        <Footer />
      </div>
      <CartDrawer />
      <Cursor />
    </SiteProviders>
  );
}
