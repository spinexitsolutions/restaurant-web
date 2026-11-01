import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <div className="display text-[40vw] leading-none sm:text-[22rem]">
        4<em className="text-accent">0</em>4
      </div>
      <p className="mt-2 text-xl text-muted">This plate has left the kitchen.</p>
      <Link href="/" className="mt-8 rounded-full bg-ink px-6 py-3.5 text-paper">Back to the table</Link>
    </section>
  );
}
