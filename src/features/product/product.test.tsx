import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '@/app/session';
import { SignInPromptProvider } from '@/components/storefront';
import {
  getProduct,
  getProductReviews,
  type ProductDetail,
  type ProductResult,
} from '@/services/catalog';
import { ProductDetailPage } from './ProductDetailPage';

vi.mock('@/services/catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/catalog')>();
  return { ...actual, getProduct: vi.fn(), getProductReviews: vi.fn() };
});

const product: ProductDetail = {
  id: 'p1',
  slug: 'white-maize',
  title: 'White Maize',
  description: 'Fresh white maize.',
  price: 18000,
  currency: 'NGN',
  unitLabel: 'per bag (50kg)',
  contactForPrice: false,
  stock: 120,
  farmName: 'Sani Grains and Produce',
  images: ['https://example.test/maize-1.jpg'],
  seller: { name: 'Ibrahim Sani', verified: true },
  rating: { value: 4, count: 1 },
  badges: { verifiedFarmer: true, featured: true },
  state: 'Kaduna',
  attributes: [{ name: 'Variety', value: 'Dent' }],
  relatedProducts: [],
  moreFromFarmer: [],
};

function renderProduct(result: ProductResult, slug = 'white-maize') {
  vi.mocked(getProduct).mockResolvedValue(result);
  vi.mocked(getProductReviews).mockResolvedValue({
    ok: true,
    data: { items: [], totalCount: 0, page: 1, pageSize: 5, totalPages: 0 },
  });
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={[`/product/${slug}`]}>
        <SignInPromptProvider>
          <Routes>
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/sign-in" element={<div>Sign in page</div>} />
          </Routes>
        </SignInPromptProvider>
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('ProductDetailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the product details', async () => {
    renderProduct({ ok: true, data: product });
    expect(await screen.findByRole('heading', { name: 'White Maize' })).toBeInTheDocument();
    expect(screen.getByText('₦18,000.00 per bag (50kg)')).toBeInTheDocument();
    expect(screen.getByText('120 in stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add to cart/i })).toBeInTheDocument();
    expect(screen.getByText('Ibrahim Sani')).toBeInTheDocument();
  });

  it('gates add-to-cart behind sign-in when signed out', async () => {
    renderProduct({ ok: true, data: product });
    const button = await screen.findByRole('button', { name: /Add to cart/i });
    await userEvent.click(button);
    expect(await screen.findByText('Sign in to continue')).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown product', async () => {
    renderProduct(
      { ok: false, notFound: true, error: { message: 'x', fieldErrors: {} } },
      'missing',
    );
    expect(await screen.findByText('Product not found')).toBeInTheDocument();
  });

  it('shows an error state with retry on failure', async () => {
    renderProduct({ ok: false, notFound: false, error: { message: 'x', fieldErrors: {} } });
    expect(await screen.findByText(/could not load this product/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });
});
