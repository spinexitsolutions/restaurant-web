import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import { IMG } from "@/lib/seed";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin login", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const s = await getSettings();
  return (
    <div className="grid min-h-dvh bg-paper font-sans text-ink lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-[32px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.darkInterior} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
          <div className="absolute left-8 top-8 flex items-center gap-2.5 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent)] text-[15px] font-semibold">{s.brand.name.charAt(0)}</span>
            <span className="text-[17px] font-semibold tracking-tight">{s.brand.name}</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="mb-3 text-[15px] font-semibold text-[var(--accent-soft)]">Restaurant OS</p>
            <h2 className="max-w-lg text-[52px] font-semibold leading-[1.02] tracking-[-0.04em]">
              Run the room.
              <span className="block text-white/55">Beautifully.</span>
            </h2>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Reservations", "Orders", "Guest CRM", "Website CMS"].map((t) => (
                <span key={t} className="glass rounded-full px-3.5 py-1.5 text-[13px] text-white/90 ring-1 ring-white/15">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <LoginForm brand={s.brand.name} />
      </div>
    </div>
  );
}
