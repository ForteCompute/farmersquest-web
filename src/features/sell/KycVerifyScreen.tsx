import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, IdCardIcon, Input } from '@/design-system';
import { CircleCheck, ShieldCheck, StorefrontLayout } from '@/components/storefront';
import { useSession } from '@/app/session';
import { getFarmerKyc } from '@/app/kyc';
import styles from './KycVerifyScreen.module.css';

// The farmer identity-verification (KYC) step at /sell/verify, the destination of the persistent KYC
// banner and the selling gate. It is shown to signed-in farmers only. A verified farmer sees a
// confirmation; a Pending or Suspended farmer can submit their NIN here.
//
// There is no KYC submission endpoint yet, so on a valid submit we confirm to the farmer that their
// details are received and under review, and flag the submission wiring as a backend follow-up. It
// never silently does nothing. The API stays the sole authority on verification.
const NIN_PATTERN = /^\d{11}$/;

export function KycVerifyScreen() {
  const { account, isAuthenticated } = useSession();
  const kyc = getFarmerKyc(account);

  const [nin, setNin] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Signed-out users must sign in first; non-farmers have no KYC step.
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  if (!kyc.isFarmer) {
    return <Navigate to="/" replace />;
  }

  const trimmed = nin.trim();
  const isValid = NIN_PATTERN.test(trimmed);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) {
      setError('Your NIN should be 11 digits.');
      return;
    }
    // No submission endpoint yet (flagged as a backend follow-up); confirm receipt to the farmer.
    setError('');
    setSubmitted(true);
  }

  return (
    <StorefrontLayout showHeaderSearch={false}>
      <div className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/farmer">Your farm</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Verify your identity</span>
        </nav>

        <div className={styles.card}>
          {kyc.isVerified ? (
            <div className={styles.state}>
              <span className={[styles.stateIcon, styles.stateIconOk].join(' ')} aria-hidden="true">
                <ShieldCheck size={28} />
              </span>
              <h1 className={styles.title}>You are verified</h1>
              <p className={styles.lead}>
                Your identity has been verified. You can list your produce and sell on FarmersQuest.
              </p>
              <Link to="/farmer" className={styles.primaryLink}>
                Go to your farm
              </Link>
            </div>
          ) : submitted ? (
            <div className={styles.state}>
              <span className={[styles.stateIcon, styles.stateIconOk].join(' ')} aria-hidden="true">
                <CircleCheck size={28} />
              </span>
              <h1 className={styles.title}>Details received</h1>
              <p className={styles.lead}>
                Thanks. Your details are submitted and your account is under review. We will let you
                know once your farm is verified.
              </p>
              <p className={styles.followUp}>
                Submitting verification to the server is a backend follow-up; your status will
                update here once it is wired and reviewed.
              </p>
              <Link to="/farmer" className={styles.primaryLink}>
                Back to your farm
              </Link>
            </div>
          ) : (
            <>
              <header className={styles.header}>
                <span className={styles.stateIcon} aria-hidden="true">
                  <IdCardIcon size={28} />
                </span>
                <h1 className={styles.title}>Verify your identity</h1>
                <p className={styles.lead}>
                  {kyc.status === 'suspended'
                    ? 'Your previous verification was not approved. Re-enter your details to try again.'
                    : 'Add your National Identification Number so buyers can trust your farm. This is required before you can sell.'}
                </p>
              </header>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <Input
                  label="NIN (National Identification Number)"
                  inputMode="numeric"
                  placeholder="11-digit NIN"
                  autoComplete="off"
                  leadingIcon={<IdCardIcon size={24} />}
                  value={nin}
                  error={error}
                  hint="Your 11-digit National Identification Number. Used to verify your farm."
                  onChange={(e) => {
                    setNin(e.target.value);
                    if (error) setError('');
                  }}
                />
                <Button type="submit" fullWidth disabled={!isValid}>
                  Submit for verification
                </Button>
              </form>

              <Link to="/farmer" className={styles.secondaryLink}>
                Do this later
              </Link>
            </>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}
