// FarmersQuest brand colours. This object is the single source of truth for colour across the
// web client, and the shared set the back office and mobile apps reuse. Never hardcode a hex value
// in a component; reference a token (in CSS, via the var(--fq-color-*) custom properties derived
// from these in src/design-system/theme.ts).
//
// Values are sampled exactly from design/DESIGN-SPEC.md (the Figma export). Do not approximate.
export const colors = {
  // Greens.
  greenDeep: '#003c00', // top bar, bottom nav, headings on light, profile header
  greenDeepest: '#002300', // deepest green, shadow accents
  greenButton: '#006400', // primary buttons, focused input border
  greenAction: '#008000', // add button, filter, prices, links, "See All"

  // Surfaces.
  surface: '#ffffff', // app background
  surfaceGreen: '#e6f0e6', // cards, profile sections
  surfaceGreenSoft: '#ebf3eb', // home background, product card background
  surfaceWarm: '#f4f4f0', // product detail background (warm neutral)

  // Neutrals and text. Exact values sampled from the Figma frames.
  inputFill: '#dddddd', // input fill, divider
  inputFillSoft: '#e9e9e9', // lighter divider variant
  borderMuted: '#b0cfb0', // muted green border, disabled
  borderMutedSoft: '#a6c9a6', // lighter muted green
  textSecondary: '#808080', // secondary text, labels (frame value)
  textSecondarySoft: '#b8b8b8', // lighter secondary text
  ink: '#1e1e1e', // body text (frame value)
  onColor: '#ffffff', // text on green

  // Semantic.
  price: '#008000', // price and positive
  danger: '#e23b3b', // wishlist active, notification dot, errors
  logout: '#a52920', // log out action (frame value)

  // Derived helpers: soft fills and a focus ring derived from the brand colours above, for surfaces
  // that need them (focus rings, error backgrounds). Not new brand colours.
  focusRing: 'rgba(0, 100, 0, 0.20)', // from greenButton
  dangerTint: '#fbe7e7', // from danger
} as const;

export type ColorToken = keyof typeof colors;
