import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card } from '@/design-system';
import { config } from '@/services/config';
import { useSession } from '@/app/session';
import { getFarmerKyc } from '@/app/kyc';
import { VerificationBanner } from '@/features/accounts';
import styles from './FarmerHome.module.css';

// The farmer home. It shows the verification banner and a status badge driven by the account's
// verification flags, and routes the farmer to finish verification before they can sell. The verified
// badge appears only when the API reports the account verified; the server enforces the real limits.
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
          ) : kyc.isPendingReview ? (
            <Badge tone="neutral">Pending verification</Badge>
          ) : (
            <Badge tone="neutral">Not verified</Badge>
          )}
          <h1 className={styles.title}>Your farm on {config.appName}</h1>
          <p className={styles.lead}>
            Sell your crops and livestock to buyers across Nigeria. List your produce, track orders,
            and manage your farm here.
          </p>
          <div className={styles.actions}>
            {kyc.canSell ? (
              <>
                <Button onClick={() => navigate('/farmer/listings')}>Your listings</Button>
                <Button variant="ghost" onClick={() => navigate('/farmer/orders')}>
                  View orders
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/sell/verify')}>Verify to start selling</Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
