import { Link } from 'react-router-dom';
import { getFarmerKyc } from '@/app/kyc';
import type { AccountDto } from '@/services/auth';
import styles from './VerificationBanner.module.css';

// The farmer verification banner, driven entirely by the account read model (verificationStatus and
// verificationReason). It shows exactly one state at a time, so the prompt and "pending" never appear
// together:
//   NotSubmitted  -> prompt to verify, with a "Verify now" action.
//   PendingReview -> "Pending verification", no action.
//   Rejected      -> the reason, with a "Resubmit" action.
//   Suspended     -> needs attention, with a "Review verification" action.
//   Verified      -> nothing (the verified badge is shown elsewhere).
// The API is the sole authority; this only reflects its state and points to the next action.
export interface VerificationBannerProps {
  account: AccountDto | null | undefined;
}

export function VerificationBanner({ account }: VerificationBannerProps) {
  const kyc = getFarmerKyc(account);

  if (!kyc.isFarmer || kyc.isVerified) {
    return null;
  }

  if (kyc.isPendingReview) {
    return (
      <div className={[styles.banner, styles.pending].join(' ')} role="status">
        <div className={styles.copy}>
          <p className={styles.title}>Pending verification</p>
          <p className={styles.text}>
            Your details are under review. We will let you know once your farm is verified.
          </p>
        </div>
      </div>
    );
  }

  const attention = kyc.isRejected || kyc.isSuspended;
  const title = kyc.isRejected
    ? 'Verification not approved'
    : kyc.isSuspended
      ? 'Your seller verification needs attention'
      : 'Verify your identity to start selling';
  const text =
    (attention && kyc.reason) ||
    (kyc.isSuspended
      ? 'Your verification was withdrawn. Review your details to keep selling on FarmersQuest.'
      : 'Add your details so buyers can trust your farm. You can browse now; selling unlocks once you are verified.');
  const actionLabel = kyc.isRejected
    ? 'Resubmit'
    : kyc.isSuspended
      ? 'Review verification'
      : 'Verify now';

  return (
    <div
      className={[styles.banner, attention ? styles.attention : styles.prompt].join(' ')}
      role="status"
    >
      <div className={styles.copy}>
        <p className={styles.title}>{title}</p>
        <p className={styles.text}>{text}</p>
      </div>
      <Link className={styles.action} to="/sell/verify">
        {actionLabel}
      </Link>
    </div>
  );
}
