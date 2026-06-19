import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './SettingsLayout.module.css';

// Shared chrome for the account settings sub-screens (edit profile, security, notifications). Sits
// inside the account layout's storefront chrome: a breadcrumb back to the account, a title and
// optional subtitle, and the form in a clean card on the page texture.
export interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function SettingsLayout({ title, subtitle, children }: SettingsLayoutProps) {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/profile">Account</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
        {children}
      </div>
    </div>
  );
}
