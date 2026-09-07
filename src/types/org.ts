export type QuestionType = "text" | "textarea" | "select" | "checkbox";

export interface ApplicationQuestion {
  id: string;            // stable key stored in FosterApplication.answers JSON
  label: string;
  type: QuestionType;
  required?: boolean;
  options?: string[];    // for select
}

export interface OrgConfig {
  name: string;
  tagline: string;
  logoPath: string;      // under /public, e.g. "/org/logo.svg"
  contact: { phone: string; email: string };
  theme: {
    colors: { primary: string; secondary: string; accent: string; bg: string; fg: string };
  };
  fostering: { intro: string; requirements: string[] };
  application: { intro: string; questions: ApplicationQuestion[] };
  supplies: { itemTypes: string[] }; // selectable supply categories
}
