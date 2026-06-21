import { apiClient } from './api';
import type { components } from './api';
import { parseProblemDetails, type ParsedProblem } from './problemDetails';

// Presentation-layer service for the Orders module (cart, checkout, buyer orders, farmer orders).
// It wraps the typed client and returns a discriminated result, so screens never touch the network
// shape. There is no business logic and no money math here: the API computes every total, owns the
// lifecycle, and enforces ownership on every call. This layer only sends the request and reshapes
// the response (and any problem-details) for the UI.

export type Cart = components['schemas']['CartDto'];
export type CartItem = components['schemas']['CartItemDto'];
export type CheckoutInput = components['schemas']['CheckoutRequest'];
export type OrderDetail = components['schemas']['OrderDetailDto'];
export type OrderSummary = components['schemas']['OrderSummaryDto'];
export type OrderPage = components['schemas']['OrderSummaryDtoPagedResult'];
export type SubOrder = components['schemas']['SubOrderDto'];
export type OrderItem = components['schemas']['OrderItemDto'];
export type Delivery = components['schemas']['DeliveryDto'];
export type SubOrderTransition = components['schemas']['SubOrderTransitionDto'];
export type FarmerOrderSummary = components['schemas']['FarmerOrderSummaryDto'];
export type FarmerOrderPage = components['schemas']['FarmerOrderSummaryDtoPagedResult'];
export type FarmerOrderDetail = components['schemas']['FarmerOrderDetailDto'];

export type Result<T> = { ok: true; data: T } | { ok: false; error: ParsedProblem };

// A result that also carries whether the failure was a 404, so a screen can show a distinct
// not-found state for an unknown or someone else's order rather than a generic error.
export type FindResult<T> =
  | { ok: true; data: T }
  | { ok: false; notFound: boolean; error: ParsedProblem };

const GENERIC_ERROR = 'We could not do that right now. Please try again.';

function failure(body: unknown, fallback = GENERIC_ERROR): { ok: false; error: ParsedProblem } {
  return { ok: false, error: parseProblemDetails(body, fallback) };
}

// The API attaches a stable machine code to its problem-details (the `code` extension), for example
// "orders.empty_cart". Screens branch on this to tailor the recovery, never on message text.
export function problemCode(body: unknown): string | null {
  if (body && typeof body === 'object' && 'code' in body) {
    const code = (body as { code?: unknown }).code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

// Stable problem codes the checkout screen tailors a message for. These mirror the API; the UI only
// uses them to choose the right friendly copy and recovery action.
export const CHECKOUT_CODES = {
  emptyCart: 'orders.empty_cart',
  cartHasInvalidItems: 'orders.cart_has_invalid_items',
  insufficientStock: 'orders.insufficient_stock',
  outOfStock: 'cart.out_of_stock',
  contactForPrice: 'cart.contact_for_price',
  productNotFound: 'cart.product_not_found',
  productUnavailable: 'cart.product_unavailable',
  expectedDateInPast: 'orders.expected_date_in_past',
} as const;

// ----- Cart -----

export async function getCart(): Promise<Result<Cart>> {
  try {
    const { data, error } = await apiClient.GET('/api/v1/cart');
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function addCartItem(productId: string, quantity: number): Promise<Result<Cart>> {
  try {
    const { data, error } = await apiClient.POST('/api/v1/cart/items', {
      body: { productId, quantity },
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function updateCartItem(productId: string, quantity: number): Promise<Result<Cart>> {
  try {
    const { data, error } = await apiClient.PUT('/api/v1/cart/items/{productId}', {
      params: { path: { productId } },
      body: { quantity },
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function removeCartItem(productId: string): Promise<Result<Cart>> {
  try {
    const { data, error } = await apiClient.DELETE('/api/v1/cart/items/{productId}', {
      params: { path: { productId } },
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

// ----- Checkout -----

// Checkout carries the problem code through so the screen can speak to the exact rejection (empty
// cart, a contact-for-price item, insufficient stock) instead of a generic error.
export type CheckoutOutcome =
  | { ok: true; order: OrderDetail }
  | { ok: false; code: string | null; error: ParsedProblem };

// The Idempotency-Key header makes a retry of the same submission return the same order rather than
// creating a second one. The caller generates the key once per attempt and reuses it on retries.
export async function checkout(
  idempotencyKey: string,
  input: CheckoutInput,
): Promise<CheckoutOutcome> {
  try {
    const { data, error } = await apiClient.POST('/api/v1/orders/checkout', {
      params: { header: { 'Idempotency-Key': idempotencyKey } },
      body: input,
    });
    if (error || !data) {
      return {
        ok: false,
        code: problemCode(error),
        error: parseProblemDetails(error, GENERIC_ERROR),
      };
    }
    return { ok: true, order: data };
  } catch {
    return { ok: false, code: null, error: parseProblemDetails(undefined, GENERIC_ERROR) };
  }
}

// ----- Buyer orders -----

export async function listMyOrders(page = 1, pageSize = 10): Promise<Result<OrderPage>> {
  try {
    const { data, error } = await apiClient.GET('/api/v1/orders', {
      params: { query: { page, pageSize } },
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function getMyOrder(orderId: string): Promise<FindResult<OrderDetail>> {
  try {
    const { data, error, response } = await apiClient.GET('/api/v1/orders/{orderId}', {
      params: { path: { orderId } },
    });
    if (error || !data) {
      return {
        ok: false,
        notFound: response?.status === 404,
        error: parseProblemDetails(error, GENERIC_ERROR),
      };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, notFound: false, error: parseProblemDetails(undefined, GENERIC_ERROR) };
  }
}

// Buyer confirms a shipped sub-order has arrived. The API only allows this from Shipped and re-checks
// ownership; the UI offers it only when the sub-order's allowedActions include "deliver".
export async function deliverSubOrder(
  orderId: string,
  subOrderId: string,
): Promise<Result<SubOrderTransition>> {
  try {
    const { data, error } = await apiClient.POST(
      '/api/v1/orders/{orderId}/sub-orders/{subOrderId}/deliver',
      { params: { path: { orderId, subOrderId } } },
    );
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

// Development-only payment simulation. The endpoint is guarded server-side (it returns 404 unless the
// API has the dev simulation enabled) and the control is only ever rendered in dev builds. It exists
// so the lifecycle can be walked in the UI before the Payments module lands.
export async function simulatePayment(orderId: string): Promise<Result<OrderDetail>> {
  try {
    const { data, error } = await apiClient.POST('/api/v1/orders/{orderId}/simulate-payment', {
      params: { path: { orderId } },
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

// ----- Farmer orders -----

export async function listFarmerOrders(page = 1, pageSize = 10): Promise<Result<FarmerOrderPage>> {
  try {
    const { data, error } = await apiClient.GET('/api/v1/farmer/orders', {
      params: { query: { page, pageSize } },
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function getFarmerOrder(orderId: string): Promise<FindResult<FarmerOrderDetail>> {
  try {
    const { data, error, response } = await apiClient.GET('/api/v1/farmer/orders/{orderId}', {
      params: { path: { orderId } },
    });
    if (error || !data) {
      return {
        ok: false,
        notFound: response?.status === 404,
        error: parseProblemDetails(error, GENERIC_ERROR),
      };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, notFound: false, error: parseProblemDetails(undefined, GENERIC_ERROR) };
  }
}

// Farmer moves their sub-order forward. The API enforces the legal transition (Paid -> Preparing,
// Preparing -> Shipped) and ownership; the UI shows each action only when allowedActions permits it.
export async function prepareSubOrder(
  orderId: string,
  subOrderId: string,
): Promise<Result<FarmerOrderDetail>> {
  try {
    const { data, error } = await apiClient.POST(
      '/api/v1/farmer/orders/{orderId}/sub-orders/{subOrderId}/prepare',
      { params: { path: { orderId, subOrderId } } },
    );
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function shipSubOrder(
  orderId: string,
  subOrderId: string,
): Promise<Result<FarmerOrderDetail>> {
  try {
    const { data, error } = await apiClient.POST(
      '/api/v1/farmer/orders/{orderId}/sub-orders/{subOrderId}/ship',
      { params: { path: { orderId, subOrderId } } },
    );
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}
