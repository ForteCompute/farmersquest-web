// Spacing, radius, shadow, sizing and layout tokens. Single source of truth on an 8px base scale.
// Reference in CSS via var(--fq-space-*), var(--fq-radius-*), var(--fq-shadow-*), var(--fq-size-*),
// var(--fq-layout-*). Radii and control height follow design/DESIGN-SPEC.md.
export const spacing = {
  // Spacing scale (rem). Numeric keys are multiples of the 0.25rem (4px) base. Page padding is 4
  // (16px); typical gaps are 3 to 4 (12 to 16px), per the spec.
  space: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  radius: {
    none: '0',
    sm: '0.5rem', // 8px, images
    md: '0.625rem', // 10px, inputs, buttons, cards (exact frame value)
    badge: '0.3125rem', // 5px, small status badges
    chip: '0.875rem', // 14px, category chips
    pill: '999px',
    circle: '50%', // add button, icon buttons, social buttons
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 35, 0, 0.06)',
    md: '0 2px 8px rgba(0, 35, 0, 0.10)',
    lg: '0 8px 24px rgba(0, 35, 0, 0.14)',
  },
  // Control sizing. Exact frame values: 46px inputs, 48px primary buttons.
  size: {
    control: '3rem', // 48px, kept for backward compatibility (matches button height)
    inputHeight: '2.875rem', // 46px, filled inputs
    buttonHeight: '3rem', // 48px, primary buttons
  },
  // Layout. Mobile frames are 402px wide; the web scales up on a wider canvas. The storefront uses
  // the wider content width below so product rows and grids fill more of a desktop screen.
  layout: {
    contentMaxWidth: '1120px',
    storefrontMaxWidth: '1320px',
    navWidth: '240px',
    mobileWidth: '402px',
  },
} as const;
