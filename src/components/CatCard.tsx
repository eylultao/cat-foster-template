import Link from "next/link";

export interface CatCardProps {
  name: string;
  slug: string;
  status: string;
  primaryPhotoUrl: string | null;
}

export function CatCard({ name, slug, status, primaryPhotoUrl }: CatCardProps) {
  return (
    <Link href={`/cats/${slug}`} className="block overflow-hidden rounded-lg border hover:shadow-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={primaryPhotoUrl ?? "/org/sample-cat.svg"} alt={name} className="h-48 w-full object-cover" />
      <div className="p-3">
        <p className="font-semibold">{name}</p>
        <span className="text-sm capitalize opacity-70">{status}</span>
      </div>
    </Link>
  );
}
