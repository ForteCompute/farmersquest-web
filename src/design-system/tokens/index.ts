// The design tokens, gathered. These three groups are the single source of truth for the brand
// look. src/design-system/theme.ts turns them into CSS custom properties; components read those
// properties, never raw values.
export { colors } from './colors';
export type { ColorToken } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const tokens = {
  colors,
  typography,
  spacing,
} as const;
