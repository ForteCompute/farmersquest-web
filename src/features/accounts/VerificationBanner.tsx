import styles from './VerificationBanner.module.css';

// Shows a farmer's verification state, driven entirely by the status string the API returns on the
// account. A new farmer registers unverified and sees the pending message here; once the API reports
// the account verified, nothing is shown. This only displays the server's value; the API is the sole
// authority on verification and on what an unverified farmer may do.
export interface VerificationBannerProps {
  status: string | null | undefined;
}

export function VerificationBanner({ status }: VerificationBannerProps) {
  const normalized = status?.trim().toLowerCase();
  if (!normalized || normalized === 'verified' || normalized === 'approved') {
    return null;
  }

  const needsAttention = normalized === 'rejected' || normalized === 'suspended';

  return (
    <div
      className={[styles.banner, needsAttention ? styles.attention : styles.pending]
        .filter(Boolean)
        .join(' ')}
      role="status"
    >
      <p className={styles.title}>
        {needsAttention
          ? 'Your farmer account needs attention'
          : 'Your farmer account is pending verification'}
      </p>
      <p className={styles.text}>
        {needsAttention
          ? 'Your verification could not be completed. Please contact support to sell on FarmersQuest.'
          : 'We are reviewing your details. You can explore the app now; selling unlocks once your account is verified.'}
      </p>
    </div>
  );
}
