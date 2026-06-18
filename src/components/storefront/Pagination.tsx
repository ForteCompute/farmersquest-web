import { ArrowRight } from './icons';
import { pageList } from './paginate';
import styles from './Pagination.module.css';

// Accessible numbered pagination with previous and next. Pure presentation: it reports the chosen
// page to the caller, which owns the URL and data. Hidden when there is a single page.
export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.nav} aria-label="Pagination">
      <button
        type="button"
        className={styles.arrow}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ArrowRight size={18} className={styles.flip} />
      </button>

      <ul className={styles.pages}>
        {pageList(page, totalPages).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={[styles.page, p === page ? styles.current : ''].join(' ')}
                onClick={() => onChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={styles.arrow}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ArrowRight size={18} />
      </button>
    </nav>
  );
}
