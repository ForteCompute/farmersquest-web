import type { ReactNode } from 'react';
import styles from './FeedbackState.module.css';

export interface ErrorStateProps {
  title?: string;
  /** A safe, user-facing message. Never surface raw API internals here. */
  description?: string;
  /** Optional retry or recovery action, for example a Button. */
  action?: ReactNode;
}

// Shown when something went wrong. The message is user-facing and safe; technical detail stays in
// logs and the network layer, never on screen.
export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  action,
}: ErrorStateProps) {
  return (
    <div className={[styles.state, styles.error].join(' ')} role="alert">
      <div className={styles.icon} aria-hidden="true">
        ⚠️
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
