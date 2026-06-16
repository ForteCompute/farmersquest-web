import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional header title. */
  title?: ReactNode;
  /** Optional content rendered on the right of the header. */
  action?: ReactNode;
  /** Drop the inner padding when the body manages its own spacing. */
  flush?: boolean;
  children: ReactNode;
}

// A surface container for grouping content. Elevation, radius, and spacing are token driven.
export function Card({ title, action, flush = false, className, children, ...rest }: CardProps) {
  return (
    <div className={[styles.card, className ?? ''].filter(Boolean).join(' ')} {...rest}>
      {(title || action) && (
        <div className={styles.header}>
          {title && <div className={styles.title}>{title}</div>}
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      <div className={flush ? styles.bodyFlush : styles.body}>{children}</div>
    </div>
  );
}
