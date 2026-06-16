import type { ReactNode } from 'react';
import styles from './Badge.module.css';

// Tones are grounded in the design spec palette: a neutral grey, the green brand, a positive green,
// and the danger red. New tones must map to a spec colour, not an invented one.
export type BadgeTone = 'neutral' | 'green' | 'success' | 'danger';

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

// A small status or category label. Tones map to token-driven colour pairs.
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={[styles.badge, styles[tone]].join(' ')}>{children}</span>;
}
