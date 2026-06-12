import { notFound } from "next/navigation";
import { getCatBySlug } from "@/server/cats";

// Always render fresh so newly added/edited cats appear immediately.
export const dynamic = "force-dynamic";

export default async function CatDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getCatBySlug(slug);
  if (!cat) notFound();

  return (
    <article className="py-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>{cat.name}</h1>
      <p className="mt-1 capitalize opacity-70">
        {[cat.breed, cat.age, cat.sex].filter(Boolean).join(" · ")} — {cat.status}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {cat.photos.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.id} src={p.url} alt={p.caption ?? cat.name} className="h-48 w-full rounded object-cover" />
        ))}
        {cat.photos.length === 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/org/sample-cat.svg" alt={cat.name} className="h-48 w-full rounded object-cover" />
        )}
      </div>
      {cat.publicBio && <p className="mt-6 max-w-prose">{cat.publicBio}</p>}
    </article>
  );
}
