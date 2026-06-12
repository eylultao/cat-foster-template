import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationForm } from "./ApplicationForm";

describe("ApplicationForm", () => {
  it("renders a field per configured question plus name/email", () => {
    render(<ApplicationForm />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // One configured question label from org.config:
    expect(screen.getByText(/do you rent or own/i)).toBeInTheDocument();
  });
});
