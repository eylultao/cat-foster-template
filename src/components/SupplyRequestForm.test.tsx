import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SupplyRequestForm } from "./SupplyRequestForm";

describe("SupplyRequestForm", () => {
  it("renders foster name field and an add-item control", () => {
    render(<SupplyRequestForm fosters={[{ id: "1", name: "Pat" }]} cats={[{ id: "c1", name: "Mochi" }]} />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add item/i })).toBeInTheDocument();
  });
});
