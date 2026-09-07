import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("hashes and verifies a correct password", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).not.toBe("hunter2");
    expect(await verifyPassword("hunter2", hash)).toBe(true);
  });
  it("rejects a wrong password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await verifyPassword("nope", hash)).toBe(false);
  });
});
