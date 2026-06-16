import { Badge, Button, Card } from '@/design-system';
import { config } from '@/services/config';
import styles from './BuyerHome.module.css';

// The buyer landing placeholder. It shows the shell, design system, and configuration are wired,
// without implementing any real buyer feature. Discovery, cart, and orders arrive with their
// tickets.
export function BuyerHome() {
  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.hero}>
          <Badge tone="green">Buyer</Badge>
          <h1 className={styles.title}>Welcome to {config.appName}</h1>
          <p className={styles.lead}>
            Buy crops and livestock directly from Nigerian farmers. Browsing, cart, and orders will
            appear here as those features are built.
          </p>
          <div className={styles.actions}>
            <Button disabled>Browse the market</Button>
            <Button variant="ghost" disabled>
              View orders
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Foundation status">
        <p className={styles.note}>
          This is the foundation shell. The app builds, runs, and is pointed at the API at{' '}
          <code>{config.apiBaseUrl}</code>. No buyer features are implemented yet.
        </p>
      </Card>
    </div>
  );
}
