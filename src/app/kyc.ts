import { mapApiRole } from './roles';
import type { AccountDto } from '@/services/auth';

// Farmer KYC (identity verification) state, derived entirely from the account read model the API
// returns (verificationStatus and verificationReason). The API is the sole authority on verification
// and on what an unverified farmer may do; the client only reads these flags to decide what to show
// and which actions to gate.
//
// The status flow drives the banner and the badge:
//   NotSubmitted  -> show the "Verify now" prompt, no badge.
//   PendingReview -> show "Pending verification", hide the prompt, no badge.
//   Verified      -> show the verified badge, no prompt, selling unlocked.
//   Rejected      -> show the reason and allow resubmission.
//   Suspended     -> needs attention, no badge.
export type KycStatus =
  | 'notApplicable'
  | 'notSubmitted'
  | 'pendingReview'
  | 'verified'
  | 'rejected'
  | 'suspended';

export interface FarmerKyc {
  /** Whether this account is a farmer (KYC only applies to farmers). */
  isFarmer: boolean;
  /** Normalised verification status. */
  status: KycStatus;
  /** The decision reason, when the API provides one (rejected or suspended). */
  reason: string | null;
  /** Verified farmer: drives the verified badge and selling access. */
  isVerified: boolean;
  /** Submitted and awaiting an admin decision. */
  isPendingReview: boolean;
  /** Rejected with a reason; the farmer can resubmit. */
  isRejected: boolean;
  /** Verified status was withdrawn; needs attention. */
  isSuspended: boolean;
  /** The farmer should start or redo verification (not submitted, or rejected). Drives the banner
   *  prompt and the "Verify now" call to action. */
  needsAction: boolean;
  /** The verify form should accept a submission (not submitted, or rejected). */
  canSubmit: boolean;
  /** The farmer may sell (create or post listings) in the UI. The backend enforces the real limits;
   *  the client only gates the path. */
  canSell: boolean;
}

function normaliseStatus(raw: string | null | undefined): KycStatus {
  switch (raw?.trim().toLowerCase()) {
    case 'notsubmitted':
      return 'notSubmitted';
    case 'pendingreview':
    case 'pending':
      return 'pendingReview';
    case 'verified':
    case 'approved':
      return 'verified';
    case 'rejected':
      return 'rejected';
    case 'suspended':
      return 'suspended';
    default:
      return 'notApplicable';
  }
}

export function getFarmerKyc(account: AccountDto | null | undefined): FarmerKyc {
  const isFarmer = mapApiRole(account?.role) === 'farmer';
  const status = isFarmer ? normaliseStatus(account?.verificationStatus) : 'notApplicable';
  const reason = account?.verificationReason?.trim() || null;
  return {
    isFarmer,
    status,
    reason,
    isVerified: status === 'verified',
    isPendingReview: status === 'pendingReview',
    isRejected: status === 'rejected',
    isSuspended: status === 'suspended',
    needsAction: status === 'notSubmitted' || status === 'rejected',
    canSubmit: status === 'notSubmitted' || status === 'rejected',
    canSell: status === 'verified',
  };
}
