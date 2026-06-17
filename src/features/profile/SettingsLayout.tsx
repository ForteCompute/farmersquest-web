import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@/design-system';
import styles from './SettingsLayout.module.css';

// Shared chrome for the account settings sub-screens (edit profile, security, notifications): a back
// link to the profile, a title and optional subtitle, and the form content in a centred column.
export interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function SettingsLayout({ title, subtitle, children }: SettingsLayoutProps) {
  return (
    <div className={styles.page}>
      <Link className={styles.back} to="/profile">
        <ArrowLeftIcon size={18} /> Account
      </Link>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>
      {children}
    </div>
  );
}
