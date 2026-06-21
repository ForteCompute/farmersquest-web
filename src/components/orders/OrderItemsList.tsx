import type { OrderItem } from '@/services/orders';
import { formatMoney } from '@/services/money';
import styles from './OrderItemsList.module.css';

// Renders the snapshotted line items of an order or sub-order: name, unit, quantity, the unit price,
// and the line total, all exactly as the API returns them. These are the values captured at checkout,
// so they never change if the catalog or a price changes later. No money math here: every figure is
// formatted for display only.
export function OrderItemsList({
  items,
  currency,
}: {
  items: OrderItem[];
  currency: string | null | undefined;
}) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.productId} className={styles.row}>
          <div className={styles.main}>
            <span className={styles.name}>{item.productName ?? 'Item'}</span>
            <span className={styles.detail}>
              {item.quantity} {item.unitLabel ? `× ${item.unitLabel}` : '×'}
              {' · '}
              {formatMoney({ amount: item.unitPrice, currency })} each
            </span>
          </div>
          <span className={styles.lineTotal}>
            {formatMoney({ amount: item.lineTotal, currency })}
          </span>
        </li>
      ))}
    </ul>
  );
}
