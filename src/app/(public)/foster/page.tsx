import Link from "next/link";
import { org } from "@/org";

export default function FosterPage() {
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>Fostering</h1>
      <p className="mt-4">{org.fostering.intro}</p>
      <h2 className="mt-8 text-xl font-semibold">Requirements</h2>
      <ul className="mt-2 list-disc pl-6">
        {org.fostering.requirements.map((r) => <li key={r}>{r}</li>)}
      </ul>
      <Link href="/apply" className="mt-8 inline-block rounded px-5 py-3 text-white"
        style={{ backgroundColor: "var(--color-primary)" }}>
        Apply to Foster
      </Link>
    </section>
  );
}
