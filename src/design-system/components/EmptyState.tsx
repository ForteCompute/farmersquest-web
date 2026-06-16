import type { ReactNode } from 'react';
import styles from './FeedbackState.module.css';

export interface EmptyStateProps {
  /** Decorative glyph (emoji or icon node). */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Optional action, for example a Button. */
  action?: ReactNode;
}

// Shown when a list or view has nothing to display yet. Calm and helpful, not an error.
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.state}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
