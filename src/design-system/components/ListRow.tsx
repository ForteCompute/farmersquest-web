import type { ReactNode } from 'react';
import styles from './ListRow.module.css';

export interface ListRowProps {
  /** Leading visual, for example an avatar or icon. */
  leading?: ReactNode;
  title: ReactNode;
  /** Secondary line under the title. */
  subtitle?: ReactNode;
  /** Trailing content, for example a price or a Badge. */
  trailing?: ReactNode;
  /** When set, the row becomes a button and reports clicks. */
  onClick?: () => void;
}

// A single row in a list: leading visual, title and subtitle, trailing content. Used for product
// lists, order lists, and similar. Money in the trailing slot is formatted by the caller with the
// money service; this row never does math.
export function ListRow({ leading, title, subtitle, trailing, onClick }: ListRowProps) {
  const content = (
    <>
      {leading && <div className={styles.leading}>{leading}</div>}
      <div className={styles.main}>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
      {trailing && <div className={styles.trailing}>{trailing}</div>}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={[styles.row, styles.clickable].join(' ')} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={styles.row}>{content}</div>;
}
