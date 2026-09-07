import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatCard } from "./CatCard";

describe("CatCard", () => {
  it("links to the cat detail and shows name + status", () => {
    render(<CatCard name="Mochi" slug="mochi" status="available" primaryPhotoUrl="/x.jpg" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/cats/mochi");
    expect(screen.getByText("Mochi")).toBeInTheDocument();
    expect(screen.getByText(/available/i)).toBeInTheDocument();
  });

  it("falls back to a placeholder when no photo", () => {
    render(<CatCard name="Biscuit" slug="biscuit" status="pending" primaryPhotoUrl={null} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/org/sample-cat.svg");
  });
});
