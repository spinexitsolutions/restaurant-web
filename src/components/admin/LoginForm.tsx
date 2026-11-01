"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { Button, inputClass, Label } from "./ui";

export default function LoginForm({ brand }: { brand: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@noor.kitchen");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError((await res.json().catch(() => ({}))).error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-sm">
      <div className="mb-8 grid h-14 w-14 place-items-center rounded-2xl bg-neutral-900 font-display text-3xl italic text-white shadow-lg">{brand.charAt(0)}</div>
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Welcome back</h1>
      <p className="mt-1.5 text-neutral-500">Sign in to the {brand} admin.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <Label>Email</Label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="username" required />
        </label>
        <label className="block">
          <Label>Password</Label>
          <div className="relative">
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass + " pr-10"} autoComplete="current-password" required autoFocus />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700" aria-label="Toggle password">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>
        {error && (
          <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }} className="text-sm text-red-600">
            {error}
          </motion.p>
        )}
        <Button type="submit" variant="dark" loading={loading} className="h-12 w-full text-[15px]">
          Sign in <ArrowRight size={16} />
        </Button>
      </form>
      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 text-sm">
        <Lock size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
        <div className="text-neutral-600">
          <div className="font-medium text-neutral-800">Demo access</div>
          admin@noor.kitchen · <span className="font-mono">noor2026</span>
          <div className="mt-1 text-xs text-neutral-400">Set ADMIN_EMAIL / ADMIN_PASSWORD in env for production.</div>
        </div>
      </div>
      <a href="/" className="mt-6 inline-block text-sm text-neutral-500 hover:text-neutral-900">← Back to website</a>
    </motion.div>
  );
}
