import Btn from "@/components/site/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <div className="display text-[40vw] leading-none sm:text-[22rem]">
        4<span className="text-accent">0</span>4
      </div>
      <p className="mt-2 text-xl text-muted">This plate has left the kitchen.</p>
      <Btn href="/" variant="dark" className="mt-8">Back to the table</Btn>
    </section>
  );
}
