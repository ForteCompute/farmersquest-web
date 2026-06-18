import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categoryIcon } from '@/components/storefront';
import { ProductListing } from '@/features/browse';
import { getCategories } from '@/services/catalog';
import { findCategory, type FoundCategory } from './findCategory';
import styles from './CategoryPage.module.css';

// The category page at /category/:slug. It looks the category up in the catalog tree (name, live
// count, subcategories), shows a header and subcategory links, then reuses the shared product
// listing scoped to this category. Unknown slugs get a clear not-found state. Loading and error
// states are handled while the tree loads.
export function CategoryPage() {
  const { slug = '' } = useParams();
  const [found, setFound] = useState<FoundCategory | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'notfound' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void getCategories().then((r) => {
      if (!active) return;
      if (!r.ok) {
        setStatus('error');
        return;
      }
      const match = findCategory(r.data, slug, null);
      if (!match) {
        setStatus('notfound');
        return;
      }
      setFound(match);
      setStatus('ok');
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={['fq-skeleton', styles.headerSkeleton].join(' ')} />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <div className={styles.state} role="alert">
          <p>We could not load this category right now.</p>
          <Link to="/browse" className={styles.stateLink}>
            Go to browse
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'notfound' || !found) {
    return (
      <div className={styles.page}>
        <div className={styles.state}>
          <h1 className={styles.notFoundTitle}>Category not found</h1>
          <p>We could not find that category. It may have moved or been renamed.</p>
          <Link to="/browse" className={styles.stateLink}>
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  const { node, parent } = found;
  const Icon = categoryIcon(node.slug);
  const count = node.productCount ?? 0;
  const subcategories = (node.children ?? []).filter((c) => c.slug);

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/browse">Browse</Link>
        {parent?.slug && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/category/${parent.slug}`}>{parent.name}</Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{node.name}</span>
      </nav>

      <header className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          <Icon size={28} />
        </span>
        <div>
          <h1 className={styles.title}>{node.name}</h1>
          <p className={styles.count}>
            {count} {count === 1 ? 'listing' : 'listings'} from verified farmers across Nigeria
          </p>
        </div>
      </header>

      {subcategories.length > 0 && (
        <nav className={styles.subcategories} aria-label="Subcategories">
          {subcategories.map((sub) => (
            <Link key={sub.id} to={`/category/${sub.slug}`} className={styles.subChip}>
              {sub.name}
              <span className={styles.subCount}>{sub.productCount ?? 0}</span>
            </Link>
          ))}
        </nav>
      )}

      <ProductListing fixedCategorySlug={node.slug ?? slug} />
    </div>
  );
}
