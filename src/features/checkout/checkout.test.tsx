import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Cart, CheckoutOutcome, OrderDetail } from '@/services/orders';
import { CheckoutPage } from './CheckoutPage';

vi.mock('@/services/orders', () => ({
  getCart: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  checkout: vi.fn(),
}));
vi.mock('@/services/catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/catalog')>();
  return { ...actual, getStates: vi.fn() };
});

import { checkout, getCart } from '@/services/orders';
import { getStates } from '@/services/catalog';

const mockGetCart = vi.mocked(getCart);
const mockCheckout = vi.mocked(checkout);

// A two-farmer cart, so the screen exercises the per-farmer grouping and the API-supplied total.
function cart(): Cart {
  return {
    items: [
      {
        productId: 'p1',
        title: 'White Maize',
        unitLabel: 'per bag',
        quantity: 2,
        unitPrice: 18000,
        lineTotal: 36000,
        seller: { id: 'f1', name: 'Sani Grains' },
        availableStock: 100,
        isValid: true,
        issue: null,
      },
      {
        productId: 'p2',
        title: 'Live Goat',
        unitLabel: 'each',
        quantity: 1,
        unitPrice: 45000,
        lineTotal: 45000,
        seller: { id: 'f2', name: 'Bello Livestock' },
        availableStock: 5,
        isValid: true,
        issue: null,
      },
    ],
    itemCount: 3,
    total: 81000,
    currency: 'NGN',
    hasInvalidItems: false,
  };
}

function order(): OrderDetail {
  return {
    orderId: 'order-123',
    status: 'PendingPayment',
    total: 81000,
    currency: 'NGN',
    delivery: {
      contactName: 'Ada Obi',
      contactPhone: '08030000000',
      addressLine: '1 Market Road',
      city: 'Ikeja',
      state: 'Lagos',
      expectedDate: '2026-12-31',
    },
    placedAtUtc: '2026-06-22T10:00:00Z',
    reservationExpiresAtUtc: '2026-06-22T10:30:00Z',
    subOrders: [],
  };
}

function renderCheckout() {
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:orderId" element={<div>Order detail page</div>} />
        <Route path="/browse" element={<div>Browse page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillDelivery(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Contact name'), 'Ada Obi');
  await user.type(screen.getByLabelText('Contact phone'), '08030000000');
  await user.type(screen.getByLabelText('Delivery address'), '1 Market Road');
  await user.type(screen.getByLabelText('City or town'), 'Ikeja');
  await user.selectOptions(screen.getByLabelText('State'), 'Lagos');
  fireEvent.change(screen.getByLabelText('Expected delivery date'), {
    target: { value: '2026-12-31' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getStates).mockResolvedValue({
    ok: true,
    data: [{ code: 'LA', name: 'Lagos' }],
  });
});

describe('CheckoutPage', () => {
  it('reviews the cart grouped by farmer with the API total', async () => {
    mockGetCart.mockResolvedValue({ ok: true, data: cart() });
    renderCheckout();

    expect(await screen.findByText('Sani Grains')).toBeInTheDocument();
    expect(screen.getByText('Bello Livestock')).toBeInTheDocument();
    expect(screen.getByText('White Maize')).toBeInTheDocument();
    // The order total is the value the API returns; the client never computes it.
    expect(screen.getByText('₦81,000.00')).toBeInTheDocument();
  });

  it('places the order with an idempotency key and lands on the order detail', async () => {
    const user = userEvent.setup();
    mockGetCart.mockResolvedValue({ ok: true, data: cart() });
    mockCheckout.mockResolvedValue({ ok: true, order: order() } satisfies CheckoutOutcome);

    renderCheckout();
    await screen.findByText('Sani Grains');
    await fillDelivery(user);
    await user.click(screen.getByRole('button', { name: /place order/i }));

    expect(mockCheckout).toHaveBeenCalledTimes(1);
    const [key, body] = mockCheckout.mock.calls[0]!;
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(0);
    expect(body).toMatchObject({
      contactName: 'Ada Obi',
      contactPhone: '08030000000',
      addressLine: '1 Market Road',
      city: 'Ikeja',
      state: 'Lagos',
      expectedDate: '2026-12-31',
    });
    expect(await screen.findByText('Order detail page')).toBeInTheDocument();
  });

  it('reuses the same idempotency key when a rejected submission is retried', async () => {
    const user = userEvent.setup();
    mockGetCart.mockResolvedValue({ ok: true, data: cart() });
    mockCheckout
      .mockResolvedValueOnce({
        ok: false,
        code: 'orders.insufficient_stock',
        error: { message: 'There is not enough stock to reserve for your order.', fieldErrors: {} },
      })
      .mockResolvedValueOnce({ ok: true, order: order() });

    renderCheckout();
    await screen.findByText('Sani Grains');
    await fillDelivery(user);

    await user.click(screen.getByRole('button', { name: /place order/i }));
    expect(await screen.findByText(/not enough stock/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /place order/i }));
    await screen.findByText('Order detail page');

    expect(mockCheckout).toHaveBeenCalledTimes(2);
    // The key is generated once for the checkout and reused on the retry, so a retry can never create
    // a second order.
    expect(mockCheckout.mock.calls[0]![0]).toBe(mockCheckout.mock.calls[1]![0]);
  });

  it('shows a friendly empty state when the cart is empty', async () => {
    mockGetCart.mockResolvedValue({
      ok: true,
      data: { items: [], itemCount: 0, total: 0, currency: 'NGN', hasInvalidItems: false },
    });
    renderCheckout();

    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /place order/i })).not.toBeInTheDocument();
  });

  it('shows an error state with retry when the cart fails to load', async () => {
    mockGetCart.mockResolvedValue({ ok: false, error: { message: 'x', fieldErrors: {} } });
    renderCheckout();

    expect(await screen.findByText(/could not load your cart/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('blocks placing until the delivery details are complete', async () => {
    mockGetCart.mockResolvedValue({ ok: true, data: cart() });
    renderCheckout();
    await screen.findByText('Sani Grains');

    // Nothing filled in yet, so the place-order action is disabled and cannot submit.
    expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled();
    expect(mockCheckout).not.toHaveBeenCalled();
  });

  it('disables checkout while invalid items remain in the cart', async () => {
    const invalid = cart();
    invalid.hasInvalidItems = true;
    invalid.items![0]!.isValid = false;
    invalid.items![0]!.issue = 'This product is out of stock.';
    mockGetCart.mockResolvedValue({ ok: true, data: invalid });

    const user = userEvent.setup();
    renderCheckout();
    await screen.findByText('Sani Grains');
    await fillDelivery(user);

    expect(screen.getByText(/no longer available/i)).toBeInTheDocument();
    expect(screen.getByText('This product is out of stock.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled();
  });
});
