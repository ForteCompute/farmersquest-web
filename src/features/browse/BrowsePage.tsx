import { Link } from 'react-router-dom';
import { ProductListing } from './ProductListing';
import styles from './BrowsePage.module.css';

// The browse page at /browse: the full catalogue with filters. Filter state lives in the URL so the
// header search (which navigates here with query, category, and state) and the in-page filters share
// one source of truth. Built on the shared listing so it matches the category page exactly.
export function BrowsePage() {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Browse</span>
      </nav>
      <header className={styles.header}>
        <h1 className={styles.title}>Browse the marketplace</h1>
        <p className={styles.lead}>
          Fresh crops and livestock from verified farmers across Nigeria. Filter by category, state,
          and price to find what you need.
        </p>
      </header>
      <ProductListing />
    </div>
  );
}
