import { describe, expect, it } from 'vitest';
import { getFarmerKyc } from './kyc';
import type { AccountDto } from '@/services/auth';

function acc(overrides: Partial<AccountDto>): AccountDto {
  return { id: '1', role: 'Farmer', verificationStatus: 'NotSubmitted', ...overrides };
}

describe('getFarmerKyc', () => {
  it('treats a non-farmer as not applicable', () => {
    const kyc = getFarmerKyc(acc({ role: 'Buyer', verificationStatus: 'NotApplicable' }));
    expect(kyc.isFarmer).toBe(false);
    expect(kyc.needsAction).toBe(false);
    expect(kyc.isVerified).toBe(false);
    expect(kyc.canSell).toBe(false);
  });

  it('prompts a not-submitted farmer to verify, and they cannot sell', () => {
    const kyc = getFarmerKyc(acc({ verificationStatus: 'NotSubmitted' }));
    expect(kyc.status).toBe('notSubmitted');
    expect(kyc.needsAction).toBe(true);
    expect(kyc.canSubmit).toBe(true);
    expect(kyc.isVerified).toBe(false);
    expect(kyc.canSell).toBe(false);
  });

  it('shows pending review with no prompt and no submit', () => {
    const kyc = getFarmerKyc(acc({ verificationStatus: 'PendingReview' }));
    expect(kyc.isPendingReview).toBe(true);
    expect(kyc.needsAction).toBe(false);
    expect(kyc.canSubmit).toBe(false);
    expect(kyc.canSell).toBe(false);
  });

  it('lets a verified farmer sell and show the badge', () => {
    const kyc = getFarmerKyc(acc({ verificationStatus: 'Verified' }));
    expect(kyc.isVerified).toBe(true);
    expect(kyc.canSell).toBe(true);
    expect(kyc.needsAction).toBe(false);
  });

  it('lets a rejected farmer resubmit and surfaces the reason', () => {
    const kyc = getFarmerKyc(
      acc({ verificationStatus: 'Rejected', verificationReason: 'Blurry photo' }),
    );
    expect(kyc.isRejected).toBe(true);
    expect(kyc.needsAction).toBe(true);
    expect(kyc.canSubmit).toBe(true);
    expect(kyc.reason).toBe('Blurry photo');
    expect(kyc.canSell).toBe(false);
  });

  it('treats a suspended farmer as needing attention, not verified or submittable', () => {
    const kyc = getFarmerKyc(acc({ verificationStatus: 'Suspended' }));
    expect(kyc.isSuspended).toBe(true);
    expect(kyc.needsAction).toBe(false);
    expect(kyc.canSubmit).toBe(false);
    expect(kyc.isVerified).toBe(false);
  });

  it('handles a missing account', () => {
    const kyc = getFarmerKyc(null);
    expect(kyc.isFarmer).toBe(false);
    expect(kyc.needsAction).toBe(false);
  });
});
