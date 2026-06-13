import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { getSupplyRequests, updateRequestStatus } from "./requests";

beforeEach(async () => { await resetDb(); });

async function makeReq(status = "new") {
  return prisma.supplyRequest.create({
    data: { fosterNameText: "Pat", items: JSON.stringify([{ type: "Food", quantity: 1 }]), status },
  });
}

describe("getSupplyRequests", () => {
  it("returns all requests newest first with relations", async () => {
    await makeReq("new");
    await makeReq("fulfilled");
    const reqs = await getSupplyRequests();
    expect(reqs).toHaveLength(2);
    expect(reqs[0]).toHaveProperty("cat");
  });
  it("filters by status", async () => {
    await makeReq("new");
    await makeReq("fulfilled");
    const reqs = await getSupplyRequests("fulfilled");
    expect(reqs).toHaveLength(1);
  });
});

describe("updateRequestStatus", () => {
  it("rejects an invalid status", async () => {
    const r = await makeReq();
    const res = await updateRequestStatus(r.id, "bogus");
    expect(res.ok).toBe(false);
  });
  it("moves a request to in_progress", async () => {
    const r = await makeReq();
    const res = await updateRequestStatus(r.id, "in_progress");
    expect(res.ok).toBe(true);
    const fresh = await prisma.supplyRequest.findUniqueOrThrow({ where: { id: r.id } });
    expect(fresh.status).toBe("in_progress");
  });
});
