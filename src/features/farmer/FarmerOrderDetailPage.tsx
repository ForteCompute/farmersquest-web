import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, ErrorState, Spinner } from '@/design-system';
import { OrderItemsList, OrderStatusBadge } from '@/components/orders';
import { formatMoney } from '@/services/money';
import { formatDate, formatDateTime } from '@/services/datetime';
import { allowsAction, ORDER_ACTIONS } from '@/services/orderStatus';
import {
  getFarmerOrder,
  prepareSubOrder,
  shipSubOrder,
  type FarmerOrderDetail,
} from '@/services/orders';
import { shortOrderId } from '@/features/orders/orderId';
import styles from './FarmerOrders.module.css';

// One incoming order in full for the farmer: the buyer's delivery details, the snapshotted items and
// subtotal, the current sub-order status, and the actions the API allows in that status. Mark
// preparing is offered only from Paid and Mark shipped only from Preparing, because the UI shows a
// control only when the API's allowedActions includes it, so the farmer is never offered a move the
// server would refuse. Each action returns the updated order, which is rendered straight away.
type Status = 'loading' | 'ok' | 'notfound' | 'error';

export function FarmerOrderDetailPage() {
  const { orderId = '' } = useParams();
  const [order, setOrder] = useState<FarmerOrderDetail | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: { aborted: boolean }) => {
      setStatus('loading');
      const result = await getFarmerOrder(orderId);
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

  async function advance(action: 'prepare' | 'ship', subOrderId: string) {
    setActing(true);
    setActionError(null);
    const result =
      action === 'prepare'
        ? await prepareSubOrder(orderId, subOrderId)
        : await shipSubOrder(orderId, subOrderId);
    setActing(false);
    if (result.ok) {
      setOrder(result.data);
    } else {
      setActionError(result.error.message);
    }
  }

  if (status === 'loading') {
    return (
      <div className={styles.detailPage}>
        <div className={styles.loading} role="status" aria-live="polite">
          <Spinner size={28} label="Loading the order" />
          <span>Loading the order…</span>
        </div>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className={styles.detailPage}>
        <EmptyState
          icon="🔍"
          title="Order not found"
          description="This order does not exist or is not one of yours."
          action={
            <Link to="/farmer/orders" className={styles.backLink}>
              Back to incoming orders
            </Link>
          }
        />
      </div>
    );
  }

  if (status === 'error' || !order) {
    return (
      <div className={styles.detailPage}>
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

  const canPrepare = allowsAction(order.allowedActions, ORDER_ACTIONS.prepare);
  const canShip = allowsAction(order.allowedActions, ORDER_ACTIONS.ship);
  const delivery = order.delivery;

  return (
    <div className={styles.detailPage}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/farmer/orders">Incoming orders</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Order {shortOrderId(order.orderId)}</span>
      </nav>

      <header className={styles.header}>
        <div>
          <h1 className={styles.heading}>Order {shortOrderId(order.orderId)}</h1>
          <p className={styles.placedAt}>Placed {formatDateTime(order.placedAtUtc) ?? '-'}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      {actionError && (
        <p className={styles.actionError} role="alert">
          {actionError}
        </p>
      )}

      <Card title="Items">
        <OrderItemsList items={order.items ?? []} currency={order.currency} />
        <div className={styles.subFooter}>
          <span className={styles.subtotalLabel}>Subtotal</span>
          <span className={styles.subtotal}>
            {formatMoney({ amount: order.subtotal, currency: order.currency })}
          </span>
        </div>
      </Card>

      <Card title="Deliver to">
        <dl className={styles.delivery}>
          <DeliveryRow label="Contact" value={delivery?.contactName} />
          <DeliveryRow label="Phone" value={delivery?.contactPhone} />
          <DeliveryRow
            label="Address"
            value={[delivery?.addressLine, delivery?.city, delivery?.state]
              .filter(Boolean)
              .join(', ')}
          />
          <DeliveryRow label="Expected date" value={formatDate(delivery?.expectedDate)} />
        </dl>
      </Card>

      {(canPrepare || canShip) && (
        <div className={styles.actions}>
          {canPrepare && (
            <Button
              onClick={() => advance('prepare', order.subOrderId ?? '')}
              loading={acting}
              loadingLabel="Updating"
            >
              Mark preparing
            </Button>
          )}
          {canShip && (
            <Button
              onClick={() => advance('ship', order.subOrderId ?? '')}
              loading={acting}
              loadingLabel="Updating"
            >
              Mark shipped
            </Button>
          )}
        </div>
      )}
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
