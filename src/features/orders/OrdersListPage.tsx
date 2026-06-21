import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyState, ErrorState, Spinner } from '@/design-system';
import { Pagination } from '@/components/storefront';
import { OrderStatusBadge } from '@/components/orders';
import { formatMoney } from '@/services/money';
import { formatDateTime } from '@/services/datetime';
import { listMyOrders, type OrderPage } from '@/services/orders';
import { shortOrderId } from './orderId';
import styles from './OrdersListPage.module.css';

// The buyer's orders, newest first and paged, exactly as the API returns them. Each row shows the
// parent order status, the item count, the placed date, and the total; opening an order shows the
// per-farmer sub-orders and their statuses. Owner-scoped: the API returns only this buyer's orders.
// Loading, empty, and error states are all handled.
const PAGE_SIZE = 10;

type Status = 'loading' | 'ok' | 'error';

export function OrdersListPage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<OrderPage | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void listMyOrders(page, PAGE_SIZE).then((r) => {
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
      <h1 className={styles.heading}>Your orders</h1>

      {status === 'loading' && (
        <div className={styles.loading} role="status" aria-live="polite">
          <Spinner size={28} label="Loading your orders" />
          <span>Loading your orders…</span>
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
          title="No orders yet"
          description="When you check out, your orders will appear here so you can track them."
          action={
            <Link to="/browse" className={styles.browseLink}>
              Browse the marketplace
            </Link>
          }
        />
      )}

      {status === 'ok' && orders.length > 0 && (
        <>
          <ul className={styles.list}>
            {orders.map((order) => (
              <li key={order.orderId}>
                <Link to={`/orders/${order.orderId}`} className={styles.row}>
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
                      {formatMoney({ amount: order.total, currency: order.currency })}
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
