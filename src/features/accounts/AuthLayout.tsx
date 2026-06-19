import type { ReactNode } from 'react';
import { ArrowLeftIcon } from '@/design-system';
import { StorefrontLayout } from '@/components/storefront';
import styles from './AuthLayout.module.css';

// Shared chrome for the account screens (account type, register, sign in, password reset). Wrapped in
// the storefront layout so the header (logo links home to the marketplace), footer, and brand
// background texture are the same as the landing. The form sits in a clean white card on the texture,
// centred, mobile first. An optional back control appears top-left of the card.
export interface AuthLayoutProps {
  children: ReactNode;
  /** When provided, shows a back control at the top-left of the card. */
  onBack?: () => void;
  backLabel?: string;
  /** Wider card for the account-type chooser (two options side by side). */
  wide?: boolean;
}

export function AuthLayout({
  children,
  onBack,
  backLabel = 'Go back',
  wide = false,
}: AuthLayoutProps) {
  return (
    <StorefrontLayout showHeaderSearch={false}>
      <div className={styles.page}>
        <div className={[styles.card, wide ? styles.wide : ''].filter(Boolean).join(' ')}>
          {onBack && (
            <button type="button" className={styles.back} onClick={onBack} aria-label={backLabel}>
              <ArrowLeftIcon size={24} />
            </button>
          )}
          {children}
        </div>
      </div>
    </StorefrontLayout>
  );
}
