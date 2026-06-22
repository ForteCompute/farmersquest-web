import { useEffect, useId, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ProductGrid, Pagination, X } from '@/components/storefront';
import {
  getCategories,
  getStates,
  isProductSort,
  listProducts,
  PRODUCT_SORTS,
  type CategoryNode,
  type ProductPage,
  type ProductQuery,
  type StateRef,
} from '@/services/catalog';
import { formatMoney } from '@/services/money';
import styles from './ProductListing.module.css';

// The shared catalogue listing used by the browse and category pages. The URL is the single source
// of truth for every filter, so results are shareable and the back button works. It owns loading,
// empty, and error states, pagination, and the filter controls. When fixedCategorySlug is set (the
// category page) the category filter is hidden and the listing stays scoped to that category.
const PAGE_SIZE = 12;

export interface ProductListingProps {
  fixedCategorySlug?: string;
}

interface CategoryOption {
  slug: string;
  label: string;
}

// Child categories are indented under their parent in the flat select. The indent uses non-breaking
// spaces (preserved in option text) so a subcategory reads as nested without any dash.
const CHILD_INDENT = '\u00A0\u00A0';

function flattenCategories(nodes: CategoryNode[]): CategoryOption[] {
  const out: CategoryOption[] = [];
  for (const node of nodes) {
    if (node.slug) out.push({ slug: node.slug, label: node.name ?? node.slug });
    for (const child of node.children ?? []) {
      if (child.slug)
        out.push({ slug: child.slug, label: `${CHILD_INDENT}${child.name ?? child.slug}` });
    }
  }
  return out;
}

export function ProductListing({ fixedCategorySlug }: ProductListingProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [states, setStates] = useState<StateRef[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [result, setResult] = useState<ProductPage | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [reloadTick, setReloadTick] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const priceLabelId = useId();

  // Current filter values, derived from the URL.
  const keyword = searchParams.get('query') ?? '';
  const categorySlug = fixedCategorySlug ?? searchParams.get('category') ?? '';
  const stateCode = searchParams.get('state') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sortParam = searchParams.get('sort');
  const sort = isProductSort(sortParam) ? sortParam : 'newest';
  const verifiedOnly = searchParams.get('verified') === 'true';
  const pageNum = Math.max(1, Number(searchParams.get('page')) || 1);

  // Local drafts for the price inputs, committed to the URL on submit.
  const [minDraft, setMinDraft] = useState(minPrice);
  const [maxDraft, setMaxDraft] = useState(maxPrice);
  useEffect(() => setMinDraft(minPrice), [minPrice]);
  useEffect(() => setMaxDraft(maxPrice), [maxPrice]);

  useEffect(() => {
    let active = true;
    void getStates().then((r) => active && r.ok && setStates(r.data));
    void getCategories().then((r) => active && r.ok && setCategories(r.data));
    return () => {
      active = false;
    };
  }, []);

  const query: ProductQuery = useMemo(() => {
    // Built without explicit undefined values so the optional fields stay absent when unset.
    const q: ProductQuery = { sort, page: pageNum, pageSize: PAGE_SIZE };
    if (keyword) q.query = keyword;
    if (categorySlug) q.categorySlug = categorySlug;
    if (stateCode) q.state = stateCode;
    if (minPrice) q.minPrice = Number(minPrice);
    if (maxPrice) q.maxPrice = Number(maxPrice);
    if (verifiedOnly) q.verifiedOnly = true;
    return q;
  }, [keyword, categorySlug, stateCode, minPrice, maxPrice, sort, verifiedOnly, pageNum]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void listProducts(query).then((r) => {
      if (!active) return;
      if (r.ok) {
        setResult(r.data);
        setStatus('ok');
      } else {
        setStatus('error');
      }
    });
    return () => {
      active = false;
    };
  }, [query, reloadTick]);

  // Merges a patch into the URL params. Empty values remove the key. Resets to page one unless the
  // patch itself changes the page.
  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next);
  }

  function goToPage(p: number) {
    update({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submitPrice(e: FormEvent) {
    e.preventDefault();
    update({ minPrice: minDraft.trim() || null, maxPrice: maxDraft.trim() || null });
    setFiltersOpen(false);
  }

  function clearAll() {
    const next = new URLSearchParams();
    // The category page keeps its route scope; only in-URL filters are cleared.
    setSearchParams(next);
    setFiltersOpen(false);
  }

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);
  const stateName = states.find((s) => s.code === stateCode)?.name ?? stateCode;
  const categoryName = categoryOptions
    .find((c) => c.slug === categorySlug)
    ?.label.replace(/^\u00A0+/, '');

  // Active filter chips with the key(s) each one clears.
  const chips: { id: string; label: string; clear: Record<string, string | null> }[] = [];
  if (keyword) chips.push({ id: 'q', label: `“${keyword}”`, clear: { query: null } });
  if (!fixedCategorySlug && categorySlug && categoryName)
    chips.push({ id: 'c', label: categoryName, clear: { category: null } });
  if (stateCode) chips.push({ id: 's', label: stateName, clear: { state: null } });
  if (minPrice || maxPrice) {
    const lo = minPrice ? formatMoney({ amount: Number(minPrice), currency: 'NGN' }) : null;
    const hi = maxPrice ? formatMoney({ amount: Number(maxPrice), currency: 'NGN' }) : null;
    const label = lo && hi ? `${lo} – ${hi}` : lo ? `From ${lo}` : `Up to ${hi}`;
    chips.push({ id: 'p', label, clear: { minPrice: null, maxPrice: null } });
  }
  if (verifiedOnly) chips.push({ id: 'v', label: 'Verified farmers', clear: { verified: null } });

  const totalCount = result?.totalCount ?? 0;
  const totalPages = result?.totalPages ?? 0;
  const products = result?.items ?? [];
  const hasFilters = chips.length > 0;

  return (
    <div className={styles.layout}>
      <button
        type="button"
        className={styles.filterToggle}
        aria-expanded={filtersOpen}
        onClick={() => setFiltersOpen((v) => !v)}
      >
        Filters{hasFilters ? ` (${chips.length})` : ''}
      </button>

      <aside className={[styles.filters, filtersOpen ? styles.filtersOpen : ''].join(' ')}>
        <div className={styles.filterHead}>
          <h2 className={styles.filterTitle}>Filters</h2>
          {hasFilters && (
            <button type="button" className={styles.clearAll} onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>

        {!fixedCategorySlug && (
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Category</span>
            <span className={styles.selectWrap}>
              <select
                value={categorySlug}
                onChange={(e) => update({ category: e.target.value || null })}
              >
                <option value="">All categories</option>
                {categoryOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} />
            </span>
          </label>
        )}

        <label className={styles.field}>
          <span className={styles.fieldLabel}>State</span>
          <span className={styles.selectWrap}>
            <select value={stateCode} onChange={(e) => update({ state: e.target.value || null })}>
              <option value="">All Nigeria</option>
              {states.map((s) => (
                <option key={s.code ?? s.name ?? ''} value={s.code ?? ''}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </span>
        </label>

        <form className={styles.field} onSubmit={submitPrice}>
          <span className={styles.fieldLabel} id={priceLabelId}>
            Price range (NGN)
          </span>
          <div className={styles.priceRow} aria-labelledby={priceLabelId}>
            <input
              className={styles.priceInput}
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min"
              value={minDraft}
              onChange={(e) => setMinDraft(e.target.value)}
              aria-label="Minimum price"
            />
            <span aria-hidden="true">–</span>
            <input
              className={styles.priceInput}
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max"
              value={maxDraft}
              onChange={(e) => setMaxDraft(e.target.value)}
              aria-label="Maximum price"
            />
          </div>
          <button type="submit" className={styles.applyPrice}>
            Apply price
          </button>
        </form>

        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => update({ verified: e.target.checked ? 'true' : null })}
          />
          <span>Verified farmers only</span>
        </label>
      </aside>

      <div className={styles.results}>
        <div className={styles.resultsHead}>
          <p className={styles.count} role="status" aria-live="polite">
            {status === 'loading'
              ? 'Loading products…'
              : `${totalCount} ${totalCount === 1 ? 'result' : 'results'}`}
          </p>
          <label className={styles.sort}>
            <span className="sr-only">Sort by</span>
            <span className={styles.selectWrap}>
              <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
                {PRODUCT_SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} />
            </span>
          </label>
        </div>

        {hasFilters && (
          <div className={styles.chips}>
            {chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={styles.chip}
                onClick={() => update(chip.clear)}
                aria-label={`Remove filter ${chip.label}`}
              >
                {chip.label} <X size={14} />
              </button>
            ))}
          </div>
        )}

        <ProductGrid
          products={products}
          loading={status === 'loading'}
          error={status === 'error'}
          onRetry={() => setReloadTick((t) => t + 1)}
          emptyState={
            <>
              <p>No products match your filters.</p>
              {hasFilters && (
                <button type="button" className={styles.clearAllButton} onClick={clearAll}>
                  Clear all filters
                </button>
              )}
            </>
          }
        />

        {status === 'ok' && (
          <Pagination page={pageNum} totalPages={totalPages} onChange={goToPage} />
        )}
      </div>
    </div>
  );
}
