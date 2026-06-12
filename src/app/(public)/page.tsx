import Link from "next/link";
import { org } from "@/org";

export default function HomePage() {
  return (
    <section className="py-12 text-center">
      <h1 className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>{org.name}</h1>
      <p className="mt-4 text-lg opacity-80">{org.tagline}</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/foster" className="rounded px-5 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>
          Become a Foster
        </Link>
        <Link href="/cats" className="rounded border px-5 py-2" style={{ borderColor: "var(--color-primary)" }}>
          Meet the Cats
        </Link>
      </div>
    </section>
  );
}
