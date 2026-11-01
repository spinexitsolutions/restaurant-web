import { readDb } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import Story from "@/components/site/home/Story";
import Stats from "@/components/site/home/Stats";
import { FadeUp, ParallaxImage, RevealText, ScrubText, SectionLabel } from "@/components/site/motion";
import { IMG } from "@/lib/seed";

export const metadata = { title: "Our story" };

const VALUES = [
  { t: "Fire first", d: "Everything passes through the tandoor, the sigri or the tawa. Smoke is our favourite spice." },
  { t: "Made here", d: "Paneer, pickles, breads, bitters, butter — if we can make it in-house, we do." },
  { t: "Seasonal, always", d: "The menu follows the market. Raw mango in summer, jackfruit in the rains, sarson in winter." },
  { t: "Warm, not stuffy", d: "Linen napkins, loud laughter. Come dressed up or come as you are." },
];

export default async function AboutPage() {
  const db = await readDb();
  const team = [...db.team].sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader eyebrow="Our story" title="A family recipe," accent="rewritten." intro={db.settings.brand.description} />
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <ParallaxImage src={IMG.openKitchen} alt="Our kitchen" className="aspect-[16/10] w-full rounded-[30px] sm:aspect-[21/9]" strength={8} />
      </div>
      <section className="mx-auto max-w-[1400px] px-5 py-28 sm:px-10 sm:py-40">
        <ScrubText text={db.settings.manifesto} className="display max-w-[22ch] text-[10vw] leading-[1.02] sm:text-6xl lg:text-7xl" />
      </section>
      <Story />
      <Stats />
      <section className="bg-ink py-28 text-paper sm:py-36">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-10">
          <SectionLabel className="mb-8 text-paper/50">What we believe</SectionLabel>
          <div className="grid gap-px overflow-hidden rounded-[28px] bg-white/10 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <FadeUp key={v.t} delay={i * 0.06} className="bg-ink p-8 sm:p-12">
                <span className="font-mono text-[12px] text-accent">0{i + 1}</span>
                <h3 className="display mt-4 text-5xl">{v.t}</h3>
                <p className="mt-3 max-w-md text-paper/60">{v.d}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-5 py-28 sm:px-10 sm:py-36">
        <SectionLabel className="mb-8 text-muted">The people</SectionLabel>
        <RevealText as="h2" text="Hands behind the fire." className="display mb-14 block text-[13vw] sm:text-7xl lg:text-8xl" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <FadeUp key={m.id} delay={i * 0.08}>
              <div className="group overflow-hidden rounded-[26px]">
                <img src={m.image} alt={m.name} loading="lazy" className="aspect-[4/5] w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
              </div>
              <h3 className="display mt-5 text-4xl">{m.name}</h3>
              <div className="eyebrow mt-1 text-accent">{m.role}</div>
              <p className="mt-3 text-muted">{m.bio}</p>
            </FadeUp>
          ))}
        </div>
      </section>
    </>
  );
}
