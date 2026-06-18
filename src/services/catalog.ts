import { apiClient } from './api';
import type { components } from './api';
import { parseProblemDetails, type ParsedProblem } from './problemDetails';

// Presentation-layer service for the public catalog read surface (FQ-31 plus FQ-35). It wraps the
// typed client and returns a discriminated result, so screens never touch the network shape. No
// business logic and no money math here: it sends the request and reshapes the response for the UI.

export type ProductSummary = components['schemas']['ProductSummaryDto'];
export type ProductDetail = components['schemas']['ProductDetailDto'];
export type CategoryNode = components['schemas']['CategoryNodeDto'];
export type StateRef = components['schemas']['StateDto'];
export type Review = components['schemas']['ReviewDto'];
export type ProductPage = components['schemas']['ProductSummaryDtoCatalogPage'];
export type ReviewPage = components['schemas']['ReviewDtoCatalogPage'];

// The products endpoint accepts sort as a free string (no enum in the contract). The exact accepted
// tokens are confirmed when the browse page is built; the landing does not sort.
export interface ProductQuery {
  query?: string;
  categorySlug?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ParsedProblem };

const GENERIC_ERROR = 'We could not load this right now. Please try again.';

function failure(body: unknown): { ok: false; error: ParsedProblem } {
  return { ok: false, error: parseProblemDetails(body, GENERIC_ERROR) };
}

// Drops undefined values so the typed client only sends the parameters that are set.
function definedParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
  ) as Partial<T>;
}

export async function listProducts(query: ProductQuery = {}): Promise<Result<ProductPage>> {
  try {
    const { data, error } = await apiClient.GET('/api/v1/catalog/products', {
      params: {
        query: definedParams({
          query: query.query,
          categorySlug: query.categorySlug,
          state: query.state,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          sort: query.sort,
          featured: query.featured,
          page: query.page,
          pageSize: query.pageSize,
        }),
      },
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function getCategories(): Promise<Result<CategoryNode[]>> {
  try {
    const { data, error } = await apiClient.GET('/api/v1/catalog/categories');
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function getStates(): Promise<Result<StateRef[]>> {
  try {
    const { data, error } = await apiClient.GET('/api/v1/catalog/reference/states');
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function getProduct(slug: string): Promise<Result<ProductDetail>> {
  try {
    const { data, error } = await apiClient.GET('/api/v1/catalog/products/{slug}', {
      params: { path: { slug } },
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function getProductReviews(
  slug: string,
  page = 1,
  pageSize = 10,
): Promise<Result<ReviewPage>> {
  try {
    const { data, error } = await apiClient.GET('/api/v1/catalog/products/{slug}/reviews', {
      params: { path: { slug }, query: { page, pageSize } },
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}
