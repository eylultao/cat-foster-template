import "server-only";
import { prisma } from "@/lib/db";

const PUBLIC_STATUSES = ["available", "pending", "adopted"];

export async function getPublicCats() {
  const cats = await prisma.cat.findMany({
    where: { status: { in: PUBLIC_STATUSES } },
    orderBy: { createdAt: "desc" },
    include: { photos: { where: { isPrimary: true }, take: 1 } },
  });
  return cats.map((c) => ({
    ...c,
    primaryPhotoUrl: c.photos[0]?.url ?? null,
  }));
}

export async function getCatBySlug(slug: string) {
  const cat = await prisma.cat.findUnique({
    where: { slug },
    include: { photos: { orderBy: { isPrimary: "desc" } } },
  });
  if (!cat || cat.status === "not_listed") return null;
  return cat;
}
