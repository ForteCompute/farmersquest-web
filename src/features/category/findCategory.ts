import type { CategoryNode } from '@/services/catalog';

// Locates a category by slug in the catalog tree, returning the node and its parent (null for a top
// category). Kept separate from the page component so it can be unit tested and the component file
// stays component-only.
export type FoundCategory = { node: CategoryNode; parent: CategoryNode | null };

export function findCategory(
  nodes: CategoryNode[],
  slug: string,
  parent: CategoryNode | null = null,
): FoundCategory | null {
  for (const node of nodes) {
    if (node.slug === slug) return { node, parent };
    const child = findCategory(node.children ?? [], slug, node);
    if (child) return child;
  }
  return null;
}
