// Money formatting for display only. The API owns all money math; this client never adds,
// multiplies, applies commission, or rounds for business meaning. It receives an exact amount and
// a currency from the API and formats it for the screen. The single currency is the Nigerian Naira.
//
// Amounts arrive from the API as already-correct values. Formatting is presentation, not
// arithmetic: we only render what the API decided.

export interface MoneyView {
  /**
   * The exact amount as provided by the API. The generated contract types every amount as optional,
   * so this is tolerant: a missing amount formats as zero rather than failing. The API always sends
   * the real amount on the screens that show money.
   */
  amount?: number | null | undefined;
  /** ISO currency code, for example NGN. Defaults to NGN, the platform currency. */
  currency?: string | null | undefined;
}

const DEFAULT_CURRENCY = 'NGN';

export function formatMoney(money: MoneyView, locale = 'en-NG'): string {
  const currency = money.currency?.trim() || DEFAULT_CURRENCY;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(money.amount ?? 0);
}
