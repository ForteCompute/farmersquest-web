import type { ReactNode } from 'react';
import { StorefrontHeader } from './StorefrontHeader';
import { StorefrontFooter } from './StorefrontFooter';
import { MobileTabBar } from './MobileTabBar';
import { SignInPromptProvider } from './SignInPrompt';
import styles from './StorefrontLayout.module.css';

// Shared chrome for the public storefront: sticky header, the page content, the footer, and on
// phones the bottom tab bar. Used by the landing, browse, category, and product pages so the header,
// footer, and tabs are built once and reused. The sign-in prompt provider lives here so the gated
// wishlist and cart controls behave the same on every storefront surface.
export function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <SignInPromptProvider>
      <div className={styles.shell}>
        <StorefrontHeader />
        <main className={styles.main}>{children}</main>
        <StorefrontFooter />
        <MobileTabBar />
      </div>
    </SignInPromptProvider>
  );
}
