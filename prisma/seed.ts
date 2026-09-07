import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_STAFF_EMAIL ?? "staff@example.org";
  const password = process.env.SEED_STAFF_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.staffUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: process.env.SEED_STAFF_NAME ?? "Org Admin" },
  });

  const cats = [
    { name: "Mochi", slug: "mochi", breed: "DSH", age: "2 years", sex: "F", status: "available",
      publicBio: "Sweet and curious lap cat looking for a quiet foster home." },
    { name: "Biscuit", slug: "biscuit", breed: "Tabby", age: "8 months", sex: "M", status: "available",
      publicBio: "Playful kitten who loves feather wands." },
    { name: "Shadow", slug: "shadow", breed: "Black DMH", age: "4 years", sex: "M", status: "pending",
      publicBio: "Gentle senior, great with calm households." },
  ];

  for (const c of cats) {
    await prisma.cat.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        ...c,
        photos: { create: [{ url: "/org/sample-cat.svg", caption: c.name, isPrimary: true }] },
      },
    });
  }

  console.log("Seed complete.");
}

main().finally(async () => { await prisma.$disconnect(); });
