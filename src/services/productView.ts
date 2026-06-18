import { formatMoney } from './money';

// Presentation helpers for displaying a catalog product. Display only: no arithmetic on money and no
// invented values. The API decides price, unit, and stock; these helpers only format them.

export interface PriceView {
  price?: number | null;
  currency?: string | null;
  unitLabel?: string | null;
  contactForPrice?: boolean;
}

// "Contact for price" when there is no price, otherwise the exact Naira amount with its unit label,
// for example "70,000 per bag (50kg)" or "3,000 per head".
export function formatProductPrice(p: PriceView): string {
  if (p.contactForPrice || p.price === null || p.price === undefined) {
    return 'Contact for price';
  }
  const money = formatMoney({ amount: p.price, currency: p.currency ?? null });
  return p.unitLabel ? `${money} ${p.unitLabel}` : money;
}

export function isContactForPrice(p: PriceView): boolean {
  return Boolean(p.contactForPrice) || p.price === null || p.price === undefined;
}

export type StockTone = 'in' | 'low' | 'out';

export interface StockView {
  tone: StockTone;
  label: string;
}

// Stock is nullable: null means not applicable (for example livestock or contact-for-price), so the
// caller hides the stock line. When present, label it for the shopper. Threshold for "low" is a
// display choice, not a business rule.
const LOW_STOCK_THRESHOLD = 5;

export function stockView(stock: number | null | undefined): StockView | null {
  if (stock === null || stock === undefined) {
    return null;
  }
  if (stock <= 0) {
    return { tone: 'out', label: 'Out of stock' };
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return { tone: 'low', label: `Low stock, ${stock} left` };
  }
  return { tone: 'in', label: `${stock} in stock` };
}

// "Kano, Kano" style location from a state value. The summary carries a single state string today.
export function formatLocation(state: string | null | undefined): string | null {
  const value = state?.trim();
  return value ? value : null;
}

// "4.5 (12)" rating display, or null when there are no ratings yet.
export function formatRating(value: number | null | undefined, count: number | null | undefined) {
  if (!count || count <= 0) {
    return null;
  }
  return { value: (value ?? 0).toFixed(1), count };
}
