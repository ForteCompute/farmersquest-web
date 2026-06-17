// Typography tokens. Single source of truth; reuse across clients. Reference in CSS via the
// var(--fq-font-*), var(--fq-text-*), var(--fq-leading-*) and var(--fq-weight-*) custom properties
// derived in src/design-system/theme.ts.
//
// The Figma frames are drawn in Nunito (rounded sans), with a system fallback. Nunito is self-hosted
// (SIL Open Font License 1.1): the font files live in fonts/nunito/ and are loaded by fonts.css,
// served from our own origin with no external CDN. The fallback stack keeps the app readable until
// the web font loads (font-display: swap).
export const typography = {
  fontFamily: {
    sans: "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  // Type scale (rem), with values taken exactly from the Figma frames.
  fontSize: {
    '2xs': '0.625rem', // 10px, terms / version footnotes
    xs: '0.75rem', // 12px, label / caption / link
    sm: '0.875rem', // 14px, secondary copy
    md: '1rem', // 16px, body / input / button label
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px, section heading
    '2xl': '1.5rem', // 24px, page heading
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
