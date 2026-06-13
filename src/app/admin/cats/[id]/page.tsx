import { notFound } from "next/navigation";
import { getCatById } from "@/server/cats";
import { getFosterOptions } from "@/server/fosters";
import { CatEditForm } from "./CatEditForm";
import { PhotoPanel } from "./PhotoPanel";
import { MedicalPanel } from "./MedicalPanel";

export default async function CatChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cat, fosters] = await Promise.all([getCatById(id), getFosterOptions()]);
  if (!cat) notFound();

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{cat.name}</h1>
        <p className="opacity-60">Chart</p>
      </div>
      <CatEditForm cat={cat} fosters={fosters} />
      <PhotoPanel catId={cat.id} photos={cat.photos} />
      <MedicalPanel catId={cat.id} records={cat.medicalRecords} />
      {/* Vet and medication panels are added in Tasks 27-28. */}
    </section>
  );
}
