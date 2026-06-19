import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card } from '@/design-system';
import { config } from '@/services/config';
import { useSession } from '@/app/session';
import { getFarmerKyc } from '@/app/kyc';
import { VerificationBanner } from '@/features/accounts';
import styles from './FarmerHome.module.css';

// The farmer landing. A newly registered farmer lands here Pending and sees the persistent KYC
// banner. The verified badge and the path to create a listing are gated on the account's
// verification flags: an unverified farmer is sent to finish KYC first, and shows no verified badge.
// The API is the sole authority and enforces the real limits; the client only reacts to the flags.
export function FarmerHome() {
  const navigate = useNavigate();
  const { account } = useSession();
  const kyc = getFarmerKyc(account);

  return (
    <div className={styles.page}>
      <VerificationBanner account={account} />

      <Card>
        <div className={styles.hero}>
          {kyc.isVerified ? (
            <Badge tone="success">Verified farmer</Badge>
          ) : (
            <Badge tone="neutral">Pending verification</Badge>
          )}
          <h1 className={styles.title}>Your farm on {config.appName}</h1>
          <p className={styles.lead}>
            Sell your crops and livestock to buyers across Nigeria. Listings, orders, and payouts
            will appear here as those features are built.
          </p>
          <div className={styles.actions}>
            {kyc.canSell ? (
              <Button disabled>Create a listing</Button>
            ) : (
              <Button onClick={() => navigate('/sell/verify')}>Verify to start selling</Button>
            )}
            <Button variant="ghost" disabled>
              View orders
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Foundation status">
        <p className={styles.note}>
          This is the foundation shell. The app builds, runs, and is pointed at the API at{' '}
          <code>{config.apiBaseUrl}</code>. No farmer features are implemented yet.
        </p>
      </Card>
    </div>
  );
}
