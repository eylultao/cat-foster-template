import "server-only";
import { prisma } from "@/lib/db";

export async function getDashboardSummary() {
  const [newApplications, openRequests, recentApplications, recentRequests] = await Promise.all([
    prisma.fosterApplication.count({ where: { status: "new" } }),
    prisma.supplyRequest.count({ where: { status: { in: ["new", "in_progress"] } } }),
    prisma.fosterApplication.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.supplyRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { cat: true, fosterParent: true } }),
  ]);
  return { newApplications, openRequests, recentApplications, recentRequests };
}
