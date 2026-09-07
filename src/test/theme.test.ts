import { describe, it, expect } from "vitest";
import { themeCssVars } from "@/org";

describe("themeCssVars", () => {
  it("emits CSS custom properties from org colors", () => {
    const css = themeCssVars();
    expect(css).toContain("--color-primary:");
    expect(css).toContain("#7c3aed");
  });
});
