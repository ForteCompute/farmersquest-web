import { describe, expect, it } from 'vitest';
import { getFarmerKyc } from './kyc';
import type { AccountDto } from '@/services/auth';

function acc(overrides: Partial<AccountDto>): AccountDto {
  return { id: '1', role: 'Farmer', verificationStatus: 'Pending', ...overrides };
}

describe('getFarmerKyc', () => {
  it('treats a non-farmer as not applicable', () => {
    const kyc = getFarmerKyc(acc({ role: 'Buyer', verificationStatus: 'NotApplicable' }));
    expect(kyc.isFarmer).toBe(false);
    expect(kyc.needsVerification).toBe(false);
    expect(kyc.isVerified).toBe(false);
    expect(kyc.canSell).toBe(false);
  });

  it('flags a pending farmer as needing verification and unable to sell', () => {
    const kyc = getFarmerKyc(acc({ verificationStatus: 'Pending' }));
    expect(kyc.status).toBe('pending');
    expect(kyc.needsVerification).toBe(true);
    expect(kyc.isVerified).toBe(false);
    expect(kyc.canSell).toBe(false);
  });

  it('lets a verified farmer sell and show the badge', () => {
    const kyc = getFarmerKyc(acc({ verificationStatus: 'Verified' }));
    expect(kyc.isVerified).toBe(true);
    expect(kyc.canSell).toBe(true);
    expect(kyc.needsVerification).toBe(false);
  });

  it('treats a suspended farmer as needing attention, not verified', () => {
    const kyc = getFarmerKyc(acc({ verificationStatus: 'Suspended' }));
    expect(kyc.status).toBe('suspended');
    expect(kyc.needsVerification).toBe(true);
    expect(kyc.isVerified).toBe(false);
    expect(kyc.canSell).toBe(false);
  });

  it('handles a missing account', () => {
    const kyc = getFarmerKyc(null);
    expect(kyc.isFarmer).toBe(false);
    expect(kyc.needsVerification).toBe(false);
  });
});
