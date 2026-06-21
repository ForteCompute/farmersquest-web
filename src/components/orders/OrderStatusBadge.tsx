import { Badge } from '@/design-system';
import { orderStatusLabel, orderStatusTone } from '@/services/orderStatus';

// A status pill for an order or sub-order. It reflects the status the API reports; it never decides
// or computes one. Label and tone come from the shared presentation mapping so every order surface
// shows the same lifecycle the same way.
export function OrderStatusBadge({ status }: { status: string | null | undefined }) {
  return <Badge tone={orderStatusTone(status)}>{orderStatusLabel(status)}</Badge>;
}
