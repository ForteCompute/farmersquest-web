import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from './icons';
import type { ProductSummary } from '@/services/catalog';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import styles from './ProductRow.module.css';

// A titled, horizontally scrolling row of product cards with a View all link. Used for featured
// products, category spotlights on the landing, and related products on the detail page. Shows
// shimmering skeletons while loading and a quiet message on error. When there are no products and
// not loading, it shows the designed empty state if one was given, otherwise renders nothing so the
// caller can hide a row it deliberately does not want (for example an empty category spotlight).
export interface ProductRowProps {
  title: string;
  viewAllHref?: string;
  products: ProductSummary[];
  loading?: boolean;
  error?: boolean;
  skeletonCount?: number;
  emptyState?: ReactNode;
}

export function ProductRow({
  title,
  viewAllHref,
  products,
  loading = false,
  error = false,
  skeletonCount = 4,
  emptyState,
}: ProductRowProps) {
  const isEmpty = !loading && !error && products.length === 0;
  if (isEmpty && !emptyState) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {viewAllHref && (
          <Link className={styles.viewAll} to={viewAllHref}>
            View all <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {error ? (
        <p className={styles.error} role="status">
          We could not load these right now.
        </p>
      ) : isEmpty ? (
        <div className={styles.empty}>{emptyState}</div>
      ) : (
        <div className={styles.row}>
          {loading
            ? Array.from({ length: skeletonCount }, (_, i) => (
                <div key={i} className={styles.cell}>
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((p) => (
                <div key={p.id} className={styles.cell}>
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      )}
    </section>
  );
}
