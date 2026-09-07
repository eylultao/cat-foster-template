import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

vi.mock("@/server/authActions", () => ({ loginAction: vi.fn() }));

describe("LoginForm", () => {
  it("renders email and password fields and a submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
