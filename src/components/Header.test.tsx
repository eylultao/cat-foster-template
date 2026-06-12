import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("Header", () => {
  it("renders the org name and a cats link", () => {
    render(<Header />);
    expect(screen.getByText(/Whiskers Foster Network/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cats/i })).toHaveAttribute("href", "/cats");
  });
});
