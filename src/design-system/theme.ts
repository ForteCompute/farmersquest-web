import { colors, typography, spacing } from './tokens';

// Turns the design tokens into CSS custom properties on :root, so every component can read brand
// values through var(--fq-*) without importing TypeScript. The tokens stay the single source of
// truth; this is the one place that projects them into CSS. Call applyTheme once at startup.
//
// Naming: --fq-color-<name>, --fq-font-<name>, --fq-text-<size>, --fq-leading-<name>,
// --fq-weight-<name>, --fq-space-<n>, --fq-radius-<name>, --fq-shadow-<name>, --fq-layout-<name>.

function toCustomProperties(): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [name, value] of Object.entries(colors)) {
    vars[`--fq-color-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(typography.fontFamily)) {
    vars[`--fq-font-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(typography.fontSize)) {
    vars[`--fq-text-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(typography.lineHeight)) {
    vars[`--fq-leading-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(typography.fontWeight)) {
    vars[`--fq-weight-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(spacing.space)) {
    vars[`--fq-space-${name}`] = value;
  }
  for (const [name, value] of Object.entries(spacing.radius)) {
    vars[`--fq-radius-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(spacing.shadow)) {
    vars[`--fq-shadow-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(spacing.size)) {
    vars[`--fq-size-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(spacing.layout)) {
    vars[`--fq-layout-${kebab(name)}`] = value;
  }

  return vars;
}

function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export const themeCustomProperties = toCustomProperties();

export function applyTheme(target: HTMLElement = document.documentElement): void {
  for (const [property, value] of Object.entries(themeCustomProperties)) {
    target.style.setProperty(property, value);
  }
}
