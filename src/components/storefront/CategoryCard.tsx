import { Link } from 'react-router-dom';
import { categoryIcon } from './iconMap';
import type { CategoryNode } from '@/services/catalog';
import styles from './CategoryCard.module.css';

// A browse-by-category tile: an icon, the category name, and the live product count. Used for both
// top categories and subcategories in the landing grid. The catalog has no category image field, so
// each category gets its own clear icon keyed by slug (an icon is ours, not data).
export interface CategoryCardProps {
  category: CategoryNode;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const count = category.productCount ?? 0;
  const Icon = categoryIcon(category.slug);

  return (
    <Link className={styles.card} to={`/category/${category.slug ?? ''}`}>
      <span className={styles.icon} aria-hidden="true">
        <Icon size={26} />
      </span>
      <span className={styles.body}>
        <span className={styles.name}>{category.name}</span>
        <span className={styles.count}>
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </span>
    </Link>
  );
}
