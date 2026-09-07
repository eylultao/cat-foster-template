import { orgConfig } from "../org.config";

export { orgConfig };
export const org = orgConfig;

export function themeCssVars(): string {
  const c = orgConfig.theme.colors;
  return [
    `--color-primary: ${c.primary};`,
    `--color-secondary: ${c.secondary};`,
    `--color-accent: ${c.accent};`,
    `--color-bg: ${c.bg};`,
    `--color-fg: ${c.fg};`,
  ].join(" ");
}
