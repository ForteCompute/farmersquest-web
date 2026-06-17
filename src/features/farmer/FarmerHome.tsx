import { Badge, Button, Card } from '@/design-system';
import { config } from '@/services/config';
import { useSession } from '@/app/session';
import { VerificationBanner } from '@/features/accounts';
import styles from './FarmerHome.module.css';

// The farmer landing placeholder. It mirrors the buyer home for the farmer role to prove role-gated
// navigation. Listings, orders, and payouts arrive with their feature tickets. A newly registered
// farmer lands here unverified and sees the verification-pending message, driven by the account
// status the API returns.
export function FarmerHome() {
  const { account } = useSession();

  return (
    <div className={styles.page}>
      <VerificationBanner status={account?.verificationStatus} />

      <Card>
        <div className={styles.hero}>
          <Badge tone="success">Farmer</Badge>
          <h1 className={styles.title}>Your farm on {config.appName}</h1>
          <p className={styles.lead}>
            Sell your crops and livestock to buyers across Nigeria. Listings, orders, and payouts
            will appear here as those features are built.
          </p>
          <div className={styles.actions}>
            <Button disabled>Create a listing</Button>
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
