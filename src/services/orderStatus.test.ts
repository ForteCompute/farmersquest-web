import { describe, expect, it } from 'vitest';
import { allowsAction, ORDER_ACTIONS, orderStatusLabel, orderStatusTone } from './orderStatus';

describe('orderStatusLabel', () => {
  it('labels the known lifecycle states', () => {
    expect(orderStatusLabel('PendingPayment')).toBe('Pending payment');
    expect(orderStatusLabel('Shipped')).toBe('Shipped');
    expect(orderStatusLabel('Completed')).toBe('Completed');
  });

  it('humanises an unknown status instead of breaking', () => {
    expect(orderStatusLabel('SomeNewState')).toBe('Some new state');
  });

  it('falls back for a missing status', () => {
    expect(orderStatusLabel(null)).toBe('Unknown');
    expect(orderStatusLabel(undefined)).toBe('Unknown');
  });
});

describe('orderStatusTone', () => {
  it('maps states to badge tones', () => {
    expect(orderStatusTone('PendingPayment')).toBe('neutral');
    expect(orderStatusTone('Paid')).toBe('green');
    expect(orderStatusTone('Delivered')).toBe('success');
    expect(orderStatusTone('Cancelled')).toBe('danger');
  });

  it('defaults an unknown status to neutral', () => {
    expect(orderStatusTone('Mystery')).toBe('neutral');
    expect(orderStatusTone(null)).toBe('neutral');
  });
});

describe('allowsAction', () => {
  it('is true only when the action is in the allowed list', () => {
    expect(allowsAction(['ship', 'cancel'], ORDER_ACTIONS.ship)).toBe(true);
    expect(allowsAction(['ship', 'cancel'], ORDER_ACTIONS.prepare)).toBe(false);
  });

  it('is false for a missing or empty list', () => {
    expect(allowsAction(null, ORDER_ACTIONS.deliver)).toBe(false);
    expect(allowsAction(undefined, ORDER_ACTIONS.deliver)).toBe(false);
    expect(allowsAction([], ORDER_ACTIONS.deliver)).toBe(false);
  });
});
