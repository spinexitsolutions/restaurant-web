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
    <div className="grid min-h-dvh bg-[#F5F5F7] font-sans lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.darkInterior} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <div className="eyebrow mb-4 text-white/60">Restaurant OS</div>
          <h2 className="display max-w-lg text-6xl">
            Run the room, <em className="text-[var(--accent-soft)]">beautifully.</em>
          </h2>
          <p className="mt-5 max-w-md text-white/70">Reservations, orders, guests and every word on your website — all in one calm place.</p>
        </div>
        <div className="absolute left-12 top-10 font-display text-3xl italic text-white">{s.brand.name}</div>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <LoginForm brand={s.brand.name} />
      </div>
    </div>
  );
}
