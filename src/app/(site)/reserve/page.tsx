import PageHeader from "@/components/site/PageHeader";
import ReserveWizard from "@/components/site/ReserveWizard";
import { IMG } from "@/lib/seed";

export const metadata = { title: "Reserve a table" };

export default async function ReservePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Reservations" title="Save me" accent="a seat." intro="Four quick steps. We hold every table for 15 minutes — and we always keep a few seats at the bar for walk-ins." />
      <ReserveWizard image={IMG.diningRoom} initial={{ date: sp.date, time: sp.time, guests: sp.guests, occasion: sp.occasion }} />
    </>
  );
}
