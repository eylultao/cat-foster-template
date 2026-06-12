import { describe, it, expect } from "vitest";
import { orgConfig } from "../../org.config";

describe("orgConfig", () => {
  it("has required branding fields", () => {
    expect(orgConfig.name).toBeTruthy();
    expect(orgConfig.theme.colors.primary).toMatch(/^#/);
  });
  it("defines at least one application question with a stable id", () => {
    expect(orgConfig.application.questions.length).toBeGreaterThan(0);
    expect(orgConfig.application.questions[0].id).toBeTruthy();
  });
});
