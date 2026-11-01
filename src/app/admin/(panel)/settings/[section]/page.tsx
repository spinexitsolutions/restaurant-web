import { notFound } from "next/navigation";
import { getSettings } from "@/lib/db";
import SettingsForm, { type SettingsSection } from "@/components/admin/SettingsForms";

export const dynamic = "force-dynamic";

const SECTIONS: SettingsSection[] = ["brand", "intro", "contact", "operations", "seo", "danger"];

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!SECTIONS.includes(section as SettingsSection)) notFound();
  return <SettingsForm key={section} section={section as SettingsSection} settings={await getSettings()} />;
}
