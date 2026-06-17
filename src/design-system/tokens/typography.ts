// Typography tokens. Single source of truth; reuse across clients. Reference in CSS via the
// var(--fq-font-*), var(--fq-text-*), var(--fq-leading-*) and var(--fq-weight-*) custom properties
// derived in src/design-system/theme.ts.
//
// Per design/DESIGN-SPEC.md: Poppins (rounded geometric sans) with a system fallback. Poppins is
// self-hosted (SIL Open Font License 1.1): the font files live in fonts/poppins/ and are loaded by
// fonts.css, served from our own origin with no external CDN. The fallback stack keeps the app
// readable until the web font loads (font-display: swap).
export const typography = {
  fontFamily: {
    sans: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  // Type scale (rem), matching the spec sizes.
  fontSize: {
    xs: '0.75rem', // 12px, label / caption
    sm: '0.8125rem', // 13px
    md: '0.9375rem', // 15px, body
    lg: '1rem', // 16px, button label
    xl: '1.25rem', // 20px, section heading
    '2xl': '1.625rem', // 26px, page heading
    '3xl': '2rem', // 32px
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.65',
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;
