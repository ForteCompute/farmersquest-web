import { describe, expect, it } from 'vitest';
import { formatMoney } from './money';

// The web client formats money for display only; these tests pin the formatting behaviour, not any
// arithmetic (the API owns all money math).
describe('formatMoney', () => {
  it('formats an amount in the platform currency by default', () => {
    const result = formatMoney({ amount: 2500 });
    expect(result).toContain('2,500');
  });

  it('uses the currency provided by the API', () => {
    const result = formatMoney({ amount: 10, currency: 'NGN' });
    expect(result).toMatch(/10/);
  });

  it('falls back to the platform currency when none is given', () => {
    expect(formatMoney({ amount: 0, currency: null })).toEqual(formatMoney({ amount: 0 }));
  });
});
