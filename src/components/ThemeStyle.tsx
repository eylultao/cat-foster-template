import { themeCssVars } from "@/org";

/**
 * Injects org theme colors as :root CSS variables. Safe because the values
 * come from the static, in-repo org.config.ts (trusted). If these colors ever
 * become user/tenant-supplied (e.g. an admin theme editor), this raw <style>
 * interpolation becomes a CSS-injection vector and the values MUST be
 * sanitized/validated before being emitted here.
 */
export function ThemeStyle() {
  return <style>{`:root { ${themeCssVars()} }`}</style>;
}
