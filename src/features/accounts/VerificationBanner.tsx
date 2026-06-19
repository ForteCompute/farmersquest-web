import { Link } from 'react-router-dom';
import { getFarmerKyc } from '@/app/kyc';
import type { AccountDto } from '@/services/auth';
import styles from './VerificationBanner.module.css';

// The persistent KYC banner for farmers, driven entirely by the account the API returns. A new
// farmer registers Pending and sees this until the API reports the account Verified; a Suspended
// farmer sees an attention variant. It links to the verification step at /sell/verify. The API is
// the sole authority on verification and on what an unverified farmer may do; this only displays the
// server's state and points to the next action.
export interface VerificationBannerProps {
  account: AccountDto | null | undefined;
}

export function VerificationBanner({ account }: VerificationBannerProps) {
  const kyc = getFarmerKyc(account);
  if (!kyc.needsVerification) {
    return null;
  }

  const attention = kyc.status === 'suspended';

  return (
    <div
      className={[styles.banner, attention ? styles.attention : styles.pending].join(' ')}
      role="status"
    >
      <div className={styles.copy}>
        <p className={styles.title}>
          {attention
            ? 'Your seller verification needs attention'
            : 'Verify your identity to start selling'}
        </p>
        <p className={styles.text}>
          {attention
            ? 'Your verification was not approved. Review your details to sell on FarmersQuest.'
            : 'Add your details so buyers can trust your farm. You can browse now; selling unlocks once you are verified.'}
        </p>
      </div>
      <Link className={styles.action} to="/sell/verify">
        {attention ? 'Review verification' : 'Verify now'}
      </Link>
    </div>
  );
}
