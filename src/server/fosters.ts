import "server-only";
import { prisma } from "@/lib/db";

export async function getFosterOptions() {
  return prisma.fosterParent.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
