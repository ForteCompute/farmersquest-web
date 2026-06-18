import type { ReactNode } from 'react';
import type { ProductSummary } from '@/services/catalog';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import styles from './ProductGrid.module.css';

// A responsive grid of product cards with the three required states: loading shows skeletons in the
// grid shape, error shows a quiet message with a retry, and empty shows the caller's designed empty
// state. Reused by the browse and category pages so the listing looks and behaves identically.
export interface ProductGridProps {
  products: ProductSummary[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyState?: ReactNode;
  skeletonCount?: number;
}

export function ProductGrid({
  products,
  loading = false,
  error = false,
  onRetry,
  emptyState,
  skeletonCount = 12,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.state} role="alert">
        <p>We could not load these products right now.</p>
        {onRetry && (
          <button type="button" className={styles.retry} onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return <div className={styles.state}>{emptyState}</div>;
  }

  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
