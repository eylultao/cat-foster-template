import { getPublicCats } from "@/server/cats";
import { CatCard } from "@/components/CatCard";

export default async function CatsPage() {
  const cats = await getPublicCats();
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>Cats Looking for Homes</h1>
      {cats.length === 0 ? (
        <p className="mt-6 opacity-70">No cats are listed right now. Please check back soon.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {cats.map((c) => (
            <CatCard key={c.id} name={c.name} slug={c.slug} status={c.status} primaryPhotoUrl={c.primaryPhotoUrl} />
          ))}
        </div>
      )}
    </section>
  );
}
