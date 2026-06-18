import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '@/app/session';
import { SignInPromptProvider } from '@/components/storefront';
import { getCategories, getStates, listProducts, type ProductPage } from '@/services/catalog';
import { ProductListing } from './ProductListing';

// Keep the real sort constants and guard; only the network calls are mocked.
vi.mock('@/services/catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/catalog')>();
  return {
    ...actual,
    listProducts: vi.fn(),
    getStates: vi.fn(),
    getCategories: vi.fn(),
  };
});

const mockList = vi.mocked(listProducts);
const mockStates = vi.mocked(getStates);
const mockCategories = vi.mocked(getCategories);

function page(items: ProductPage['items'], totalCount = items?.length ?? 0): ProductPage {
  return { items: items ?? [], totalCount, page: 1, pageSize: 12, totalPages: 1 };
}

function renderListing(path = '/browse') {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={[path]}>
        <SignInPromptProvider>
          <ProductListing />
        </SignInPromptProvider>
      </MemoryRouter>
    </SessionProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockStates.mockResolvedValue({ ok: true, data: [] });
  mockCategories.mockResolvedValue({ ok: true, data: [] });
});

describe('ProductListing', () => {
  it('renders products and the result count', async () => {
    mockList.mockResolvedValue({
      ok: true,
      data: page([{ id: '1', slug: 'white-maize', title: 'White Maize', currency: 'NGN' }]),
    });
    renderListing();
    expect(await screen.findByText('White Maize')).toBeInTheDocument();
    expect(await screen.findByText('1 result')).toBeInTheDocument();
  });

  it('builds the catalog query from the URL parameters', async () => {
    mockList.mockResolvedValue({ ok: true, data: page([]) });
    renderListing('/browse?query=rice&state=Kano&minPrice=1000&sort=price_desc&verified=true');
    expect(await screen.findByText('0 results')).toBeInTheDocument();
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'rice',
        state: 'Kano',
        minPrice: 1000,
        sort: 'price_desc',
        verifiedOnly: true,
        page: 1,
      }),
    );
  });

  it('shows the designed empty state when nothing matches', async () => {
    mockList.mockResolvedValue({ ok: true, data: page([]) });
    renderListing('/browse?query=nothing');
    expect(await screen.findByText(/No products match your filters/i)).toBeInTheDocument();
  });

  it('shows an error state when the request fails', async () => {
    mockList.mockResolvedValue({
      ok: false,
      error: { message: 'Something went wrong', fieldErrors: {} },
    });
    renderListing();
    expect(await screen.findByText(/could not load these products/i)).toBeInTheDocument();
  });
});
