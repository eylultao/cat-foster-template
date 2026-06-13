"use client";
import { useState } from "react";
import { updateCat } from "@/server/catActions";
import { CAT_STATUSES } from "@/server/catConstants";

type Cat = {
  id: string; name: string; status: string; breed: string | null; age: string | null;
  sex: string | null; publicBio: string | null; behaviorNotes: string | null;
  foodType: string | null; foodPortion: string | null; currentFosterParentId: string | null;
};

export function CatEditForm({ cat, fosters }: { cat: Cat; fosters: { id: string; name: string }[] }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | undefined>();
  async function onSubmit(formData: FormData) {
    setSaved(false); setError(undefined);
    const res = await updateCat(cat.id, formData);
    if (res.ok) setSaved(true);
    else setError(Object.values(res.errors ?? {})[0] ?? "Could not save");
  }
  return (
    <form action={onSubmit} className="space-y-3">
      <Row label="Name"><input name="name" defaultValue={cat.name} className="w-full rounded border p-2" /></Row>
      <Row label="Status">
        <select name="status" defaultValue={cat.status} className="w-full rounded border p-2">
          {CAT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Row>
      <Row label="Breed"><input name="breed" defaultValue={cat.breed ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Age"><input name="age" defaultValue={cat.age ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Sex"><input name="sex" defaultValue={cat.sex ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Public bio"><textarea name="publicBio" defaultValue={cat.publicBio ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Behavior notes"><textarea name="behaviorNotes" defaultValue={cat.behaviorNotes ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Food type"><input name="foodType" defaultValue={cat.foodType ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Food portion"><input name="foodPortion" defaultValue={cat.foodPortion ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Foster parent">
        <select name="currentFosterParentId" defaultValue={cat.currentFosterParentId ?? ""} className="w-full rounded border p-2">
          <option value="">— none —</option>
          {fosters.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </Row>
      <button type="submit" className="rounded px-4 py-3 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Save chart</button>
      {saved && <span className="ml-3 text-green-700">Saved.</span>}
      {error && <span className="ml-3 text-red-600">{error}</span>}
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={id} className="grid grid-cols-[140px_1fr] items-start gap-3">
      <span className="pt-2 text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
