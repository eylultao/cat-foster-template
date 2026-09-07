import { getFosterOptions } from "@/server/fosters";
import { getCatOptions } from "@/server/cats";
import { SupplyRequestForm } from "@/components/SupplyRequestForm";

// Always render fresh so newly added fosters/cats appear in the dropdowns.
export const dynamic = "force-dynamic";

export default async function RequestPage() {
  const [fosters, cats] = await Promise.all([getFosterOptions(), getCatOptions()]);
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>Foster Supply Request</h1>
      <p className="mt-2 mb-6 opacity-80">Need food, litter, medication, or toys? Let us know. For urgent matters, please call us.</p>
      <SupplyRequestForm fosters={fosters} cats={cats} />
    </section>
  );
}
