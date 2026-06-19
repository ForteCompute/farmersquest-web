import { mapApiRole } from './roles';
import type { AccountDto } from '@/services/auth';

// Farmer KYC (identity verification) state, derived entirely from the account the API returns. The
// API is the sole authority on verification and on what an unverified farmer may do; the client only
// reads these flags to decide what to show and which actions to gate. A farmer starts Pending after
// signup, cannot sell, and shows no verified badge until the API reports Verified.

export type KycStatus = 'none' | 'pending' | 'verified' | 'suspended';

export interface FarmerKyc {
  /** Whether this account is a farmer (KYC only applies to farmers). */
  isFarmer: boolean;
  /** Normalised verification status. */
  status: KycStatus;
  /** Farmer whose identity the API has verified. Drives the verified badge and selling access. */
  isVerified: boolean;
  /** Farmer who still needs to complete or fix verification (pending or suspended). Drives the
   *  persistent KYC banner. */
  needsVerification: boolean;
  /** Whether the farmer may sell (create or post listings) in the UI. The backend enforces the real
   *  limits; the client only gates the path. */
  canSell: boolean;
}

function normaliseStatus(raw: string | null | undefined): KycStatus {
  switch (raw?.trim().toLowerCase()) {
    case 'verified':
    case 'approved':
      return 'verified';
    case 'suspended':
    case 'rejected':
      return 'suspended';
    case 'pending':
      return 'pending';
    default:
      return 'none';
  }
}

export function getFarmerKyc(account: AccountDto | null | undefined): FarmerKyc {
  const isFarmer = mapApiRole(account?.role) === 'farmer';
  const status = normaliseStatus(account?.verificationStatus);
  const isVerified = isFarmer && status === 'verified';
  return {
    isFarmer,
    status,
    isVerified,
    needsVerification: isFarmer && (status === 'pending' || status === 'suspended'),
    canSell: isVerified,
  };
}
