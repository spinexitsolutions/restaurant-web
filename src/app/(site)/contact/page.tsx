import { Mail, MapPin, Phone } from "lucide-react";
import { readDb } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import ContactForm, { FaqList } from "@/components/site/ContactForm";
import Visit from "@/components/site/home/Visit";
import { SectionLabel } from "@/components/site/motion";

export const metadata = { title: "Contact" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const db = await readDb();
  const c = db.settings.contact;
  const { subject } = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Contact" title="Say hello," accent="we're listening." intro="Private dining, feedback, collaborations or just a question about the menu — write to us." />
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 sm:px-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          {[
            { Icon: Phone, k: "Call", v: c.phone, href: `tel:${c.phone}` },
            { Icon: Mail, k: "Write", v: c.email, href: `mailto:${c.email}` },
            { Icon: MapPin, k: "Visit", v: `${c.address}, ${c.city}`, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery)}` },
          ].map(({ Icon, k, v, href }) => (
            <a key={k} href={href} target={k === "Visit" ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-5 rounded-[24px] bg-cream p-6 ring-1 ring-ink/5 transition hover:bg-ink hover:text-paper">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent text-paper"><Icon size={20} /></span>
              <span>
                <span className="eyebrow block text-muted group-hover:text-paper/50">{k}</span>
                <span className="text-[18px]">{v}</span>
              </span>
            </a>
          ))}
        </div>
        <ContactForm initialSubject={subject} />
      </div>
      <section className="mx-auto max-w-[1400px] px-5 pt-28 sm:px-10 sm:pt-36">
        <SectionLabel className="mb-8 text-muted">FAQ</SectionLabel>
        <FaqList faqs={[...db.faqs].sort((a, b) => a.order - b.order)} />
      </section>
      <Visit />
    </>
  );
}
