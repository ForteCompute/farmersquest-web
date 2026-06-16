import type { ReactNode } from 'react';
import styles from './Nav.module.css';

export interface NavItem {
  key: string;
  label: string;
  /** Optional leading glyph (emoji or icon node). */
  icon?: ReactNode;
  /** Optional trailing content, for example a Badge. */
  trailing?: ReactNode;
}

export interface NavProps {
  items: NavItem[];
  /** Optional heading above the items. */
  title?: string;
  /**
   * Renders the clickable element for an item. The design system owns the look and hands back the
   * class names to apply; the host app supplies the actual link (for example a router NavLink) and
   * decides the active state. This keeps the design system free of any routing dependency.
   */
  renderLink: (item: NavItem, classNames: { link: string; active: string }) => ReactNode;
}

// Vertical navigation used by the app shell. Reusable across clients: it knows nothing about the
// router, only how navigation should look.
export function Nav({ items, title, renderLink }: NavProps) {
  return (
    <nav className={styles.nav} aria-label={title ?? 'Primary'}>
      {title && <p className={styles.title}>{title}</p>}
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.key} className={styles.item}>
            {renderLink(item, { link: styles.link ?? '', active: styles.linkActive ?? '' })}
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Exposed so a host can compose item contents (icon, label, trailing) consistently inside its link.
export function NavItemContent({ item }: { item: NavItem }) {
  return (
    <>
      {item.icon && (
        <span className={styles.icon} aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className={styles.label}>{item.label}</span>
      {item.trailing && <span className={styles.trailing}>{item.trailing}</span>}
    </>
  );
}
