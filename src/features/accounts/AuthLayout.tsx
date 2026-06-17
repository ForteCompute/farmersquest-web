import type { ReactNode } from 'react';
import { ArrowLeftIcon } from '@/design-system';
import styles from './AuthLayout.module.css';

// The shared chrome for the account screens (registration, and later sign in and password reset).
// Mobile-first: a single centred column at the frame width, centred and padded on larger viewports.
// No app shell or navigation; these screens are shown before the user is in the authenticated app.
export interface AuthLayoutProps {
  children: ReactNode;
  /** When provided, shows the frame's top-left back control. */
  onBack?: () => void;
  backLabel?: string;
}

export function AuthLayout({ children, onBack, backLabel = 'Go back' }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <div className={styles.column}>
        {onBack && (
          <button type="button" className={styles.back} onClick={onBack} aria-label={backLabel}>
            <ArrowLeftIcon size={24} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
