import Btn from "@/components/site/Button";
import { CalendarDays, Clock, Users } from "lucide-react";
import { readDb } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import { FadeUp, SectionLabel } from "@/components/site/motion";
import { fmtDate, money, to12h } from "@/lib/format";
import { IMG } from "@/lib/seed";

export const metadata = { title: "Experiences" };

export default async function EventsPage() {
  const db = await readDb();
  const events = db.events.filter((e) => e.published).sort((a, b) => a.date.localeCompare(b.date));
  const cur = db.settings.ordering.currency;
  return (
    <>
      <PageHeader eyebrow="Experiences" title="Gather" accent="around the fire." intro="Tasting menus, Sunday feasts, masterclasses and private dinners. Limited seats, unlimited stories." />
      <div className="mx-auto max-w-[1400px] space-y-6 px-5 pb-20 sm:px-10">
        {events.map((e, i) => (
          <FadeUp key={e.id} delay={0.05}>
            <article className="group grid overflow-hidden rounded-[30px] bg-cream ring-1 ring-ink/5 md:grid-cols-[1.1fr_1fr]">
              <div className={`relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[440px] ${i % 2 ? "md:order-2" : ""}`}>
                <img src={e.image} alt={e.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
                <div className="glass absolute left-5 top-5 flex flex-col items-center rounded-[18px] px-4 py-2 text-paper">
                  <span className="display text-[28px] leading-none">{new Date(e.date + "T00:00:00").getDate()}</span>
                  <span className="eyebrow text-[10px]">{fmtDate(e.date, { month: "short" })}</span>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
                <div>
                  <h2 className="display text-[34px] sm:text-[44px]">{e.title}</h2>
                  <p className="mt-4 max-w-lg text-[17px] text-muted text-pretty">{e.description}</p>
                </div>
                <div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-line py-4 text-[14px]">
                    <span className="flex items-center gap-2"><CalendarDays size={15} className="text-accent" /> {fmtDate(e.date, { weekday: "long", day: "numeric", month: "long" })}</span>
                    <span className="flex items-center gap-2"><Clock size={15} className="text-accent" /> {to12h(e.time)}</span>
                    <span className="flex items-center gap-2"><Users size={15} className="text-accent" /> {e.seats} seats</span>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="display text-[28px]">{money(e.price, cur)} <span className="font-sans text-[14px] text-muted">per guest</span></span>
                    <Btn href={`/reserve?occasion=${encodeURIComponent(e.title)}&date=${e.date}&time=${e.time}`} variant="dark" size="sm">Book seats</Btn>
                  </div>
                </div>
              </div>
            </article>
          </FadeUp>
        ))}
        {!events.length && <p className="py-20 text-center text-muted">New experiences are being planned. Check back soon.</p>}
      </div>
      <section className="mx-auto max-w-[1400px] px-5 pb-32 sm:px-10">
        <div className="relative overflow-hidden rounded-[30px] bg-ink p-8 text-paper sm:p-16">
          <img src={IMG.aerial} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="relative max-w-2xl">
            <SectionLabel className="mb-6 text-paper/60">Private dining</SectionLabel>
            <h2 className="display text-[40px] sm:text-[52px]">Your party, <em className="text-accent-soft">our fire.</em></h2>
            <p className="mt-5 text-paper/70">Birthdays, offsites, weddings and wrap parties for 10 to 80 guests. Custom menus, your playlist, our team.</p>
            <Btn href="/contact?subject=Private%20dining" variant="light" size="lg" className="mt-8">Plan an event</Btn>
          </div>
        </div>
      </section>
    </>
  );
}
