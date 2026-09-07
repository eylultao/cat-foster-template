import Link from "next/link";
import { getAllCats } from "@/server/cats";
import { NewCatForm } from "./NewCatForm";

export default async function AdminCatsPage() {
  const cats = await getAllCats();
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Cats</h1>
        <NewCatForm />
      </div>
      <ul className="mt-6 divide-y rounded border">
        {cats.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-3">
            <Link href={`/admin/cats/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
            <span className="capitalize opacity-70">{c.status}</span>
          </li>
        ))}
        {cats.length === 0 && <li className="p-3 opacity-60">No cats yet — add one above.</li>}
      </ul>
    </section>
  );
}
