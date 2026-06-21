import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { OrderDetail, OrderPage, SubOrder } from '@/services/orders';
import { OrderDetailPage } from './OrderDetailPage';
import { OrdersListPage } from './OrdersListPage';

vi.mock('@/services/orders', () => ({
  getMyOrder: vi.fn(),
  deliverSubOrder: vi.fn(),
  simulatePayment: vi.fn(),
  listMyOrders: vi.fn(),
}));

import { deliverSubOrder, getMyOrder, listMyOrders } from '@/services/orders';

const mockGetMyOrder = vi.mocked(getMyOrder);
const mockDeliver = vi.mocked(deliverSubOrder);
const mockListMyOrders = vi.mocked(listMyOrders);

function subOrder(overrides: Partial<SubOrder> = {}): SubOrder {
  return {
    subOrderId: 'sub-1',
    farmerId: 'f1',
    farmerName: 'Sani Grains',
    status: 'Paid',
    subtotal: 36000,
    items: [
      {
        productId: 'p1',
        productName: 'White Maize',
        unitLabel: 'per bag',
        quantity: 2,
        unitPrice: 18000,
        lineTotal: 36000,
      },
    ],
    allowedActions: [],
    ...overrides,
  };
}

function order(overrides: Partial<OrderDetail> = {}): OrderDetail {
  return {
    orderId: 'order-1',
    status: 'Paid',
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
    subOrders: [
      subOrder({
        subOrderId: 'sub-1',
        farmerName: 'Sani Grains',
        status: 'Shipped',
        allowedActions: ['deliver'],
      }),
      subOrder({
        subOrderId: 'sub-2',
        farmerId: 'f2',
        farmerName: 'Bello Livestock',
        status: 'Paid',
        subtotal: 45000,
        allowedActions: [],
        items: [
          {
            productId: 'p2',
            productName: 'Live Goat',
            unitLabel: 'each',
            quantity: 1,
            unitPrice: 45000,
            lineTotal: 45000,
          },
        ],
      }),
    ],
    ...overrides,
  };
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/orders/order-1']}>
      <Routes>
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/orders" element={<div>Orders list</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('OrderDetailPage', () => {
  it('shows the per-farmer sub-orders with snapshot items and totals', async () => {
    mockGetMyOrder.mockResolvedValue({ ok: true, data: order() });
    renderDetail();

    expect(await screen.findByText('Sani Grains')).toBeInTheDocument();
    expect(screen.getByText('Bello Livestock')).toBeInTheDocument();
    expect(screen.getByText('White Maize')).toBeInTheDocument();
    expect(screen.getByText('Live Goat')).toBeInTheDocument();
    // Two deliveries split out of the one order.
    expect(screen.getByText(/2 deliveries/i)).toBeInTheDocument();
  });

  it('offers Confirm delivery only on a sub-order the API marks deliverable', async () => {
    mockGetMyOrder.mockResolvedValue({ ok: true, data: order() });
    renderDetail();

    await screen.findByText('Sani Grains');
    // Only the Shipped sub-order (allowedActions includes "deliver") gets the control.
    expect(screen.getAllByRole('button', { name: /confirm delivery/i })).toHaveLength(1);
  });

  it('confirms delivery through the API and reloads the order', async () => {
    const user = userEvent.setup();
    mockGetMyOrder.mockResolvedValueOnce({ ok: true, data: order() }).mockResolvedValueOnce({
      ok: true,
      data: order({
        subOrders: [
          subOrder({
            subOrderId: 'sub-1',
            farmerName: 'Sani Grains',
            status: 'Delivered',
            allowedActions: [],
          }),
        ],
      }),
    });
    mockDeliver.mockResolvedValue({
      ok: true,
      data: {
        orderId: 'order-1',
        subOrderId: 'sub-1',
        subOrderStatus: 'Delivered',
        orderStatus: 'Paid',
      },
    });

    renderDetail();
    await screen.findByText('Sani Grains');
    await user.click(screen.getByRole('button', { name: /confirm delivery/i }));

    expect(mockDeliver).toHaveBeenCalledWith('order-1', 'sub-1');
    // After the reload the deliverable control is gone.
    expect(
      await screen.findByText((_, el) => el?.textContent === '1 delivery'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm delivery/i })).not.toBeInTheDocument();
  });

  it('hides the dev simulate-payment control once the order is no longer pending payment', async () => {
    mockGetMyOrder.mockResolvedValue({ ok: true, data: order({ status: 'Paid' }) });
    renderDetail();
    await screen.findByText('Sani Grains');
    expect(screen.queryByRole('button', { name: /simulate payment/i })).not.toBeInTheDocument();
  });

  it('shows the dev simulate-payment control while payment is pending', async () => {
    mockGetMyOrder.mockResolvedValue({ ok: true, data: order({ status: 'PendingPayment' }) });
    renderDetail();
    await screen.findByText('Sani Grains');
    // The test build runs in dev mode, where the guarded control is rendered.
    expect(screen.getByRole('button', { name: /simulate payment/i })).toBeInTheDocument();
  });

  it("shows a not-found state for an order that is not the buyer's", async () => {
    mockGetMyOrder.mockResolvedValue({
      ok: false,
      notFound: true,
      error: { message: 'x', fieldErrors: {} },
    });
    renderDetail();
    expect(await screen.findByText(/order not found/i)).toBeInTheDocument();
  });
});

describe('OrdersListPage', () => {
  function page(): OrderPage {
    return {
      items: [
        {
          orderId: 'order-1',
          status: 'Shipped',
          total: 81000,
          currency: 'NGN',
          itemCount: 3,
          placedAtUtc: '2026-06-22T10:00:00Z',
        },
      ],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    };
  }

  function renderList() {
    return render(
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/orders" element={<OrdersListPage />} />
          <Route path="/orders/:orderId" element={<div>Order detail</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('lists orders with their parent status and total', async () => {
    mockListMyOrders.mockResolvedValue({ ok: true, data: page() });
    renderList();

    expect(await screen.findByText('Order #order')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByText('₦81,000.00')).toBeInTheDocument();
  });

  it('shows an empty state when there are no orders', async () => {
    mockListMyOrders.mockResolvedValue({
      ok: true,
      data: { ...page(), items: [], totalCount: 0, totalPages: 0 },
    });
    renderList();
    expect(await screen.findByText(/no orders yet/i)).toBeInTheDocument();
  });
});
