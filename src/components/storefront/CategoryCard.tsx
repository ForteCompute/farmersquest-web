import { Link } from 'react-router-dom';
import { LeafIcon } from '@/design-system';
import type { CategoryNode } from '@/services/catalog';
import styles from './CategoryCard.module.css';

// A browse-by-category card: an icon, the category name, the live product count, and the first few
// subcategories. The catalog has no category image field, so a brand icon is used (an icon is ours,
// not data). The count and subcategories are live from the catalog.
export interface CategoryCardProps {
  category: CategoryNode;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const subs = (category.children ?? []).slice(0, 3);
  const count = category.productCount ?? 0;

  return (
    <Link className={styles.card} to={`/category/${category.slug ?? ''}`}>
      <span className={styles.icon} aria-hidden="true">
        <LeafIcon size={24} />
      </span>
      <span className={styles.body}>
        <span className={styles.name}>{category.name}</span>
        <span className={styles.count}>
          {count} {count === 1 ? 'item' : 'items'}
        </span>
        {subs.length > 0 && (
          <span className={styles.subs}>
            {subs
              .map((s) => s.name)
              .filter(Boolean)
              .join(' · ')}
          </span>
        )}
      </span>
    </Link>
  );
}
