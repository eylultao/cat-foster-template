"use client";
import { uploadPhotoAction, setPrimaryAction, deletePhotoAction } from "@/server/photoActions";

type Photo = { id: string; url: string; caption: string | null; isPrimary: boolean };

export function PhotoPanel({ catId, photos }: { catId: string; photos: Photo[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Photos</h2>
      <form action={async (fd) => { await uploadPhotoAction(catId, fd); }} className="mt-2 flex items-center gap-2">
        <input type="file" name="file" accept="image/*" required aria-label="Photo file" />
        <input name="caption" placeholder="Caption (optional)" aria-label="Photo caption" className="rounded border p-2" />
        <button type="submit" className="rounded px-3 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Upload</button>
      </form>
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">
        {photos.map((p) => (
          <div key={p.id} className="rounded border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption ?? ""} className="h-32 w-full rounded object-cover" />
            <div className="mt-1 flex items-center justify-between text-xs">
              {p.isPrimary ? <span className="font-semibold text-green-700">Primary</span>
                : <button onClick={() => setPrimaryAction(catId, p.id)} className="underline">Make primary</button>}
              <button onClick={() => deletePhotoAction(catId, p.id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {photos.length === 0 && <p className="opacity-60">No photos yet.</p>}
      </div>
    </div>
  );
}
