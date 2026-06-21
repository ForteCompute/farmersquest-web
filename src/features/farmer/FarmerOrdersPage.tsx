import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyState, ErrorState, Spinner } from '@/design-system';
import { Pagination } from '@/components/storefront';
import { OrderStatusBadge } from '@/components/orders';
import { formatMoney } from '@/services/money';
import { formatDateTime } from '@/services/datetime';
import { listFarmerOrders, type FarmerOrderPage } from '@/services/orders';
import { shortOrderId } from '@/features/orders/orderId';
import styles from './FarmerOrders.module.css';

// The farmer's incoming orders, newest first and paged. Each row is one of the farmer's sub-orders
// (their part of a buyer order) with its status, item count, placed date, and subtotal. The list is
// owner-scoped by the API: a farmer only ever sees the sub-orders for their own farm. Loading, empty,
// and error states are handled.
const PAGE_SIZE = 10;

type Status = 'loading' | 'ok' | 'error';

export function FarmerOrdersPage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<FarmerOrderPage | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void listFarmerOrders(page, PAGE_SIZE).then((r) => {
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
  }, [page, reloadTick]);

  const orders = result?.items ?? [];
  const totalPages = result?.totalPages ?? 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Incoming orders</h1>

      {status === 'loading' && (
        <div className={styles.loading} role="status" aria-live="polite">
          <Spinner size={28} label="Loading incoming orders" />
          <span>Loading incoming orders…</span>
        </div>
      )}

      {status === 'error' && (
        <ErrorState
          title="We could not load your orders"
          description="Please try again in a moment."
          action={
            <Button variant="secondary" onClick={() => setReloadTick((t) => t + 1)}>
              Try again
            </Button>
          }
        />
      )}

      {status === 'ok' && orders.length === 0 && (
        <EmptyState
          icon="📦"
          title="No incoming orders yet"
          description="When a buyer orders your produce, it will appear here for you to prepare and ship."
        />
      )}

      {status === 'ok' && orders.length > 0 && (
        <>
          <ul className={styles.list}>
            {orders.map((order) => (
              <li key={order.subOrderId}>
                <Link to={`/farmer/orders/${order.orderId}`} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={styles.orderNo}>Order {shortOrderId(order.orderId)}</span>
                    <span className={styles.rowMeta}>
                      {formatDateTime(order.placedAtUtc) ?? '-'} · {order.itemCount}{' '}
                      {order.itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className={styles.rowEnd}>
                    <OrderStatusBadge status={order.status} />
                    <span className={styles.rowTotal}>
                      {formatMoney({ amount: order.subtotal, currency: order.currency })}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
