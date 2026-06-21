import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, ErrorState, Spinner } from '@/design-system';
import { OrderItemsList, OrderStatusBadge } from '@/components/orders';
import { formatMoney } from '@/services/money';
import { formatDate, formatDateTime } from '@/services/datetime';
import { allowsAction, ORDER_ACTIONS } from '@/services/orderStatus';
import { deliverSubOrder, getMyOrder, simulatePayment, type OrderDetail } from '@/services/orders';
import { shortOrderId } from './orderId';
import styles from './OrderDetailPage.module.css';

// One of the buyer's orders in full: the delivery details, and a card per farmer (the sub-orders)
// with the snapshotted items, line totals, sub-order status, and subtotal, plus the order total. All
// figures and statuses come straight from the API. When a sub-order is Shipped the API offers the
// "deliver" action, and only then does the Confirm delivery control appear. A development-only
// simulate-payment control (never shown in a production build) lets the lifecycle be walked before
// the Payments module lands.
type Status = 'loading' | 'ok' | 'notfound' | 'error';

export function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const location = useLocation();
  const justPlaced = (location.state as { placed?: boolean } | null)?.placed === true;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [acting, setActing] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: { aborted: boolean }) => {
      setStatus('loading');
      const result = await getMyOrder(orderId);
      if (signal?.aborted) return;
      if (result.ok) {
        setOrder(result.data);
        setStatus('ok');
      } else {
        setStatus(result.notFound ? 'notfound' : 'error');
      }
    },
    [orderId],
  );

  useEffect(() => {
    const signal = { aborted: false };
    void load(signal);
    return () => {
      signal.aborted = true;
    };
  }, [load]);

  async function confirmDelivered(subOrderId: string) {
    setActing(subOrderId);
    setActionError(null);
    const result = await deliverSubOrder(orderId, subOrderId);
    setActing(null);
    if (result.ok) {
      await load();
    } else {
      setActionError(result.error.message);
    }
  }

  async function runSimulatePayment() {
    setActing('simulate');
    setActionError(null);
    const result = await simulatePayment(orderId);
    setActing(null);
    if (result.ok) {
      setOrder(result.data);
    } else {
      setActionError(result.error.message);
    }
  }

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.loading} role="status" aria-live="polite">
          <Spinner size={28} label="Loading your order" />
          <span>Loading your order…</span>
        </div>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className={styles.page}>
        <EmptyState
          icon="🔍"
          title="Order not found"
          description="This order does not exist or is not yours to view."
          action={
            <Link to="/orders" className={styles.backLink}>
              Back to your orders
            </Link>
          }
        />
      </div>
    );
  }

  if (status === 'error' || !order) {
    return (
      <div className={styles.page}>
        <ErrorState
          title="We could not load this order"
          description="Please try again in a moment."
          action={
            <Button variant="secondary" onClick={() => void load()}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const subOrders = order.subOrders ?? [];
  const showDevSimulate = import.meta.env.DEV && order.status === 'PendingPayment';

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/orders">Your orders</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Order {shortOrderId(order.orderId)}</span>
      </nav>

      {justPlaced && (
        <p className={styles.placedBanner} role="status">
          Your order is placed. It is split into a delivery per farmer below.
        </p>
      )}

      <header className={styles.header}>
        <div>
          <h1 className={styles.heading}>Order {shortOrderId(order.orderId)}</h1>
          <p className={styles.placedAt}>Placed {formatDateTime(order.placedAtUtc) ?? '-'}</p>
        </div>
        <div className={styles.headerEnd}>
          <OrderStatusBadge status={order.status} />
          <span className={styles.total}>
            {formatMoney({ amount: order.total, currency: order.currency })}
          </span>
        </div>
      </header>

      {actionError && (
        <p className={styles.actionError} role="alert">
          {actionError}
        </p>
      )}

      {showDevSimulate && (
        <div className={styles.devPanel}>
          <div>
            <p className={styles.devTitle}>Development tool</p>
            <p className={styles.devText}>
              Payments is not built yet. Simulate a confirmed payment to move this order to Paid so
              the rest of the lifecycle can be walked.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={runSimulatePayment}
            loading={acting === 'simulate'}
            loadingLabel="Simulating payment"
          >
            Simulate payment
          </Button>
        </div>
      )}

      <Card title="Delivery details">
        <dl className={styles.delivery}>
          <DeliveryRow label="Contact" value={order.delivery?.contactName} />
          <DeliveryRow label="Phone" value={order.delivery?.contactPhone} />
          <DeliveryRow
            label="Address"
            value={[order.delivery?.addressLine, order.delivery?.city, order.delivery?.state]
              .filter(Boolean)
              .join(', ')}
          />
          <DeliveryRow label="Expected date" value={formatDate(order.delivery?.expectedDate)} />
        </dl>
      </Card>

      <section className={styles.subOrders} aria-label="Sub-orders by farmer">
        <h2 className={styles.subHeading}>
          {subOrders.length} {subOrders.length === 1 ? 'delivery' : 'deliveries'}
        </h2>
        {subOrders.map((sub) => (
          <Card key={sub.subOrderId}>
            <div className={styles.subHead}>
              <div>
                <p className={styles.farmerName}>{sub.farmerName ?? 'Farmer'}</p>
                <p className={styles.subId}>Delivery {shortOrderId(sub.subOrderId)}</p>
              </div>
              <OrderStatusBadge status={sub.status} />
            </div>

            <OrderItemsList items={sub.items ?? []} currency={order.currency} />

            <div className={styles.subFooter}>
              <span className={styles.subtotalLabel}>Subtotal</span>
              <span className={styles.subtotal}>
                {formatMoney({ amount: sub.subtotal, currency: order.currency })}
              </span>
            </div>

            {allowsAction(sub.allowedActions, ORDER_ACTIONS.deliver) && (
              <div className={styles.subActions}>
                <Button
                  onClick={() => confirmDelivered(sub.subOrderId ?? '')}
                  loading={acting === sub.subOrderId}
                  loadingLabel="Confirming delivery"
                >
                  Confirm delivery
                </Button>
              </div>
            )}
          </Card>
        ))}
      </section>
    </div>
  );
}

function DeliveryRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className={styles.deliveryRow}>
      <dt>{label}</dt>
      <dd>{value || 'Not set'}</dd>
    </div>
  );
}
