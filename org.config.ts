import type { OrgConfig } from "@/types/org";

export const orgConfig: OrgConfig = {
  name: "Whiskers Foster Network",
  tagline: "Helping NYC cats find loving foster homes",
  logoPath: "/org/logo.svg",
  contact: { phone: "(555) 010-2030", email: "hello@example.org" },
  theme: {
    colors: {
      primary: "#7c3aed",
      secondary: "#0ea5e9",
      accent: "#f59e0b",
      bg: "#ffffff",
      fg: "#1f2937",
    },
  },
  fostering: {
    intro:
      "Fostering saves lives. You provide a temporary home; we cover medical care and supplies.",
    requirements: [
      "Be 18 or older",
      "Provide a safe indoor space",
      "Keep foster cats separate from resident pets initially",
      "Bring cats to scheduled vet appointments",
    ],
  },
  application: {
    intro: "Tell us a bit about you and your home.",
    questions: [
      { id: "housing", label: "Do you rent or own?", type: "select", required: true, options: ["Rent", "Own"] },
      { id: "landlord_ok", label: "If renting, does your landlord allow pets?", type: "select", options: ["Yes", "No", "N/A"] },
      { id: "other_pets", label: "What other pets do you have?", type: "textarea" },
      { id: "experience", label: "Describe any prior fostering experience.", type: "textarea" },
      { id: "space", label: "Can you provide a separate room if needed?", type: "checkbox" },
    ],
  },
  supplies: { itemTypes: ["Food", "Litter", "Medication", "Toys", "Other"] },
};

export default orgConfig;
