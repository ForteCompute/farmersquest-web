// Money formatting for display only. The API owns all money math; this client never adds,
// multiplies, applies commission, or rounds for business meaning. It receives an exact amount and
// a currency from the API and formats it for the screen. The single currency is the Nigerian Naira.
//
// Amounts arrive from the API as already-correct values. Formatting is presentation, not
// arithmetic: we only render what the API decided.

export interface MoneyView {
  /** The exact amount as provided by the API. */
  amount: number;
  /** ISO currency code, for example NGN. Defaults to NGN, the platform currency. */
  currency?: string | null;
}

const DEFAULT_CURRENCY = 'NGN';

export function formatMoney(money: MoneyView, locale = 'en-NG'): string {
  const currency = money.currency?.trim() || DEFAULT_CURRENCY;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(money.amount);
}
