import type { BadgeTone } from '@/design-system';

// Presentation mapping for the order lifecycle. The API is the authority on an order's status and on
// which actions are allowed in that status; this module only turns the status string into a label and
// a badge tone for display, and reads the API's allowedActions list. No business logic and no money
// math: it never decides a transition, it only reflects what the API already decided.

// The lifecycle states the API reports, with the human label for each. The status strings come from
// the API; an unknown one falls back to a humanised version of the raw value so nothing breaks if the
// contract adds a state.
const STATUS_LABELS: Record<string, string> = {
  PendingPayment: 'Pending payment',
  Paid: 'Paid',
  Preparing: 'Preparing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Disputed: 'Disputed',
};

const STATUS_TONES: Record<string, BadgeTone> = {
  PendingPayment: 'neutral',
  Paid: 'green',
  Preparing: 'green',
  Shipped: 'green',
  Delivered: 'success',
  Completed: 'success',
  Cancelled: 'danger',
  Disputed: 'danger',
};

// "PendingPayment" -> "Pending payment", as a safe fallback for an unrecognised status.
function humanise(raw: string): string {
  const spaced = raw.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

export function orderStatusLabel(status: string | null | undefined): string {
  if (!status) {
    return 'Unknown';
  }
  return STATUS_LABELS[status] ?? humanise(status);
}

export function orderStatusTone(status: string | null | undefined): BadgeTone {
  if (!status) {
    return 'neutral';
  }
  return STATUS_TONES[status] ?? 'neutral';
}

// The action tokens the API returns in a sub-order's allowedActions. The UI shows a control only when
// its token is present, so it can never offer a move the server would refuse.
export const ORDER_ACTIONS = {
  prepare: 'prepare',
  ship: 'ship',
  deliver: 'deliver',
  cancel: 'cancel',
} as const;

export type OrderAction = (typeof ORDER_ACTIONS)[keyof typeof ORDER_ACTIONS];

export function allowsAction(
  actions: readonly string[] | null | undefined,
  action: OrderAction,
): boolean {
  return Array.isArray(actions) && actions.includes(action);
}
