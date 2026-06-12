import "server-only";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export async function authorizeStaff(email: string, password: string) {
  const user = await prisma.staffUser.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name ?? null };
}
