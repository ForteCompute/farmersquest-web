import styles from './ProductCard.module.css';
import skel from './Skeleton.module.css';

// A grey placeholder in the exact shape of the product card, shown while products load so the grid
// keeps its size and does not jump. The shimmer comes from the shared .fq-skeleton utility.
export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={[styles.media, 'fq-skeleton'].join(' ')} />
      <div className={styles.body}>
        <span className={[skel.line, skel.short, 'fq-skeleton'].join(' ')} />
        <span className={[skel.line, 'fq-skeleton'].join(' ')} />
        <span className={[skel.line, skel.price, 'fq-skeleton'].join(' ')} />
        <div className={styles.footer}>
          <span className={[skel.line, skel.seller, 'fq-skeleton'].join(' ')} />
        </div>
      </div>
    </div>
  );
}
