import { prisma } from "@/lib/db";

export async function resetDb() {
  // Delete children before parents to satisfy FK constraints.
  await prisma.supplyRequest.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.vetAppointment.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.catPhoto.deleteMany();
  await prisma.fosterApplication.deleteMany();
  await prisma.cat.deleteMany();
  await prisma.fosterParent.deleteMany();
  await prisma.staffUser.deleteMany();
}
