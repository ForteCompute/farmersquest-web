// Builds a compact page list with ellipses, always including the first, last, and current pages.
// Kept separate from the Pagination component so the component file stays component-only.
export function pageList(page: number, total: number): (number | 'gap')[] {
  const pages = new Set<number>([1, total, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('gap');
    out.push(p);
    prev = p;
  }
  return out;
}
