import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { FarmerOrderDetail } from '@/services/orders';
import { FarmerOrderDetailPage } from './FarmerOrderDetailPage';

vi.mock('@/services/orders', () => ({
  getFarmerOrder: vi.fn(),
  prepareSubOrder: vi.fn(),
  shipSubOrder: vi.fn(),
  listFarmerOrders: vi.fn(),
}));

import { getFarmerOrder, prepareSubOrder, shipSubOrder } from '@/services/orders';

const mockGetFarmerOrder = vi.mocked(getFarmerOrder);
const mockPrepare = vi.mocked(prepareSubOrder);
const mockShip = vi.mocked(shipSubOrder);

function detail(overrides: Partial<FarmerOrderDetail> = {}): FarmerOrderDetail {
  return {
    orderId: 'order-1',
    subOrderId: 'sub-1',
    status: 'Paid',
    subtotal: 36000,
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
    allowedActions: ['prepare'],
    ...overrides,
  };
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/farmer/orders/order-1']}>
      <Routes>
        <Route path="/farmer/orders/:orderId" element={<FarmerOrderDetailPage />} />
        <Route path="/farmer/orders" element={<div>Incoming orders</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('FarmerOrderDetailPage', () => {
  it('shows the items, subtotal, and the buyer delivery details', async () => {
    mockGetFarmerOrder.mockResolvedValue({ ok: true, data: detail() });
    renderDetail();

    expect(await screen.findByText('White Maize')).toBeInTheDocument();
    // The line total and the subtotal are both shown.
    expect(screen.getAllByText('₦36,000.00').length).toBeGreaterThan(0);
    expect(screen.getByText('Ada Obi')).toBeInTheDocument();
  });

  it('offers Mark preparing from Paid, and not Mark shipped yet', async () => {
    mockGetFarmerOrder.mockResolvedValue({
      ok: true,
      data: detail({ status: 'Paid', allowedActions: ['prepare'] }),
    });
    renderDetail();

    await screen.findByText('White Maize');
    expect(screen.getByRole('button', { name: /mark preparing/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark shipped/i })).not.toBeInTheDocument();
  });

  it('advances Paid to Preparing then offers Mark shipped', async () => {
    const user = userEvent.setup();
    mockGetFarmerOrder.mockResolvedValue({
      ok: true,
      data: detail({ status: 'Paid', allowedActions: ['prepare'] }),
    });
    mockPrepare.mockResolvedValue({
      ok: true,
      data: detail({ status: 'Preparing', allowedActions: ['ship'] }),
    });

    renderDetail();
    await screen.findByText('White Maize');
    await user.click(screen.getByRole('button', { name: /mark preparing/i }));

    expect(mockPrepare).toHaveBeenCalledWith('order-1', 'sub-1');
    // The updated order is rendered straight away, now offering the next legal move.
    expect(await screen.findByRole('button', { name: /mark shipped/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark preparing/i })).not.toBeInTheDocument();
  });

  it('ships from Preparing through the API', async () => {
    const user = userEvent.setup();
    mockGetFarmerOrder.mockResolvedValue({
      ok: true,
      data: detail({ status: 'Preparing', allowedActions: ['ship'] }),
    });
    mockShip.mockResolvedValue({
      ok: true,
      data: detail({ status: 'Shipped', allowedActions: [] }),
    });

    renderDetail();
    await screen.findByText('White Maize');
    await user.click(screen.getByRole('button', { name: /mark shipped/i }));

    expect(mockShip).toHaveBeenCalledWith('order-1', 'sub-1');
    // Shipped has no farmer action left, so no progress controls remain.
    expect(screen.queryByRole('button', { name: /mark shipped/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark preparing/i })).not.toBeInTheDocument();
  });

  it('shows no progress controls when the status allows none', async () => {
    mockGetFarmerOrder.mockResolvedValue({
      ok: true,
      data: detail({ status: 'Delivered', allowedActions: [] }),
    });
    renderDetail();

    await screen.findByText('White Maize');
    expect(screen.queryByRole('button', { name: /mark preparing/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark shipped/i })).not.toBeInTheDocument();
  });
});
