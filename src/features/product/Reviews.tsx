import { useEffect, useState } from 'react';
import { Star } from '@/components/storefront';
import { getProductReviews, type Review, type ReviewPage } from '@/services/catalog';
import styles from './Reviews.module.css';

// The reviews section for a product. Fetches a page of reviews from the catalog, newest first, with
// a Show more control that appends the next page. Handles loading, empty, and error states. Read
// only: ratings come from the API; nothing is computed here.
export interface ReviewsProps {
  slug: string;
  ratingValue?: number | null;
  ratingCount?: number | null;
}

const PAGE_SIZE = 5;

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className={styles.stars} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={15} className={i < rounded ? styles.starFull : styles.starEmpty} />
      ))}
    </span>
  );
}

function formatDate(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function Reviews({ slug, ratingValue, ratingCount }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ReviewPage | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    // Reset when the product changes.
    setReviews([]);
    setPage(1);
    setMeta(null);
  }, [slug]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void getProductReviews(slug, page, PAGE_SIZE).then((r) => {
      if (!active) return;
      if (r.ok) {
        setMeta(r.data);
        setReviews((prev) =>
          page === 1 ? (r.data.items ?? []) : [...prev, ...(r.data.items ?? [])],
        );
        setStatus('ok');
      } else {
        setStatus('error');
      }
    });
    return () => {
      active = false;
    };
  }, [slug, page]);

  const total = meta?.totalCount ?? ratingCount ?? 0;
  const hasMore = meta ? (meta.page ?? 1) < (meta.totalPages ?? 1) : false;

  return (
    <section className={styles.section} aria-labelledby="reviews-heading">
      <div className={styles.head}>
        <h2 className={styles.heading} id="reviews-heading">
          Reviews
        </h2>
        {ratingCount && ratingCount > 0 && (
          <span className={styles.summary}>
            <Stars value={ratingValue ?? 0} />
            <strong>{(ratingValue ?? 0).toFixed(1)}</strong>
            <span className={styles.summaryCount}>
              ({total} {total === 1 ? 'review' : 'reviews'})
            </span>
          </span>
        )}
      </div>

      {status === 'loading' && reviews.length === 0 ? (
        <ul className={styles.list} aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className={styles.review}>
              <div className={['fq-skeleton', styles.skeletonLine].join(' ')} />
              <div className={['fq-skeleton', styles.skeletonBlock].join(' ')} />
            </li>
          ))}
        </ul>
      ) : status === 'error' && reviews.length === 0 ? (
        <p className={styles.notice} role="alert">
          We could not load reviews right now.
        </p>
      ) : reviews.length === 0 ? (
        <p className={styles.notice}>
          No reviews yet. Be the first to buy and review this product.
        </p>
      ) : (
        <>
          <ul className={styles.list}>
            {reviews.map((review, i) => (
              <li key={`${review.reviewerName}-${i}`} className={styles.review}>
                <div className={styles.reviewHead}>
                  <span className={styles.reviewer}>{review.reviewerName ?? 'Verified buyer'}</span>
                  <span className={styles.date}>{formatDate(review.date)}</span>
                </div>
                <Stars value={review.rating ?? 0} />
                {review.text && <p className={styles.text}>{review.text}</p>}
              </li>
            ))}
          </ul>
          {hasMore && (
            <button
              type="button"
              className={styles.more}
              onClick={() => setPage((p) => p + 1)}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Loading…' : 'Show more reviews'}
            </button>
          )}
        </>
      )}
    </section>
  );
}
