"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCat } from "@/server/catActions";

export function NewCatForm() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  async function onSubmit(formData: FormData) {
    const res = await createCat(formData);
    if (res.ok) { router.push(`/admin/cats/${res.id}`); }
    else setError(res.errors?.name ?? "Could not create cat");
  }
  return (
    <form action={onSubmit} className="flex items-end gap-2">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">New cat name</label>
        <input id="name" name="name" className="mt-1 rounded border p-2" />
      </div>
      <button type="submit" className="rounded px-4 py-3 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Add cat</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
