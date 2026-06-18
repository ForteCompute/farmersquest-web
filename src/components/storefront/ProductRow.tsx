import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@/design-system';
import type { ProductSummary } from '@/services/catalog';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import styles from './ProductRow.module.css';

// A titled, horizontally scrolling row of product cards with a View all link. Used for featured
// products, category spotlights on the landing, and related products on the detail page. Shows
// shimmering skeletons while loading and a quiet message on error. Renders nothing when there are no
// products and not loading, so the caller can hide an empty category row.
export interface ProductRowProps {
  title: string;
  viewAllHref?: string;
  products: ProductSummary[];
  loading?: boolean;
  error?: boolean;
  skeletonCount?: number;
}

export function ProductRow({
  title,
  viewAllHref,
  products,
  loading = false,
  error = false,
  skeletonCount = 4,
}: ProductRowProps) {
  if (!loading && !error && products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {viewAllHref && (
          <Link className={styles.viewAll} to={viewAllHref}>
            View all <ArrowRightIcon size={16} />
          </Link>
        )}
      </div>

      {error ? (
        <p className={styles.error} role="status">
          We could not load these right now.
        </p>
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
