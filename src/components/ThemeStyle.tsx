import { themeCssVars } from "@/org";

export function ThemeStyle() {
  return <style>{`:root { ${themeCssVars()} }`}</style>;
}
