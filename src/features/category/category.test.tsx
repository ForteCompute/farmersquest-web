import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '@/app/session';
import { SignInPromptProvider } from '@/components/storefront';
import { getCategories, getStates, listProducts, type CategoryNode } from '@/services/catalog';
import { CategoryPage } from './CategoryPage';
import { findCategory } from './findCategory';

vi.mock('@/services/catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/catalog')>();
  return {
    ...actual,
    listProducts: vi.fn(),
    getStates: vi.fn(),
    getCategories: vi.fn(),
  };
});

const tree: CategoryNode[] = [
  {
    id: 'c1',
    slug: 'crops',
    name: 'Crops',
    productCount: 12,
    children: [{ id: 'c2', slug: 'grains', name: 'Grains and Cereals', productCount: 3 }],
  },
];

describe('findCategory', () => {
  it('finds a top category with no parent', () => {
    const found = findCategory(tree, 'crops');
    expect(found?.node.name).toBe('Crops');
    expect(found?.parent).toBeNull();
  });

  it('finds a subcategory and returns its parent', () => {
    const found = findCategory(tree, 'grains');
    expect(found?.node.name).toBe('Grains and Cereals');
    expect(found?.parent?.slug).toBe('crops');
  });

  it('returns null for an unknown slug', () => {
    expect(findCategory(tree, 'nope')).toBeNull();
  });
});

function renderCategory(slug: string) {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={[`/category/${slug}`]}>
        <SignInPromptProvider>
          <Routes>
            <Route path="/category/:slug" element={<CategoryPage />} />
          </Routes>
        </SignInPromptProvider>
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('CategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStates).mockResolvedValue({ ok: true, data: [] });
    vi.mocked(listProducts).mockResolvedValue({
      ok: true,
      data: { items: [], totalCount: 0, page: 1, pageSize: 12, totalPages: 0 },
    });
  });

  it('renders the category header and its subcategories', async () => {
    vi.mocked(getCategories).mockResolvedValue({ ok: true, data: tree });
    renderCategory('crops');
    expect(await screen.findByRole('heading', { name: 'Crops' })).toBeInTheDocument();
    expect(await screen.findByText('Grains and Cereals')).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown category', async () => {
    vi.mocked(getCategories).mockResolvedValue({ ok: true, data: tree });
    renderCategory('unknown');
    expect(await screen.findByText(/Category not found/i)).toBeInTheDocument();
  });
});
