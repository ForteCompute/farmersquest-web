import { Link } from 'react-router-dom';
import styles from './AuthLegal.module.css';

// The legal line shown under the auth forms. Links to the real Terms of Service and Privacy Policy
// pages with clear wording. The action verb is configurable so the sentence reads correctly per
// screen ("creating an account", "signing in").
export function AuthLegal({ action = 'continuing' }: { action?: string }) {
  return (
    <p className={styles.legal}>
      By {action}, you agree to our{' '}
      <Link className={styles.link} to="/terms">
        Terms of Service
      </Link>{' '}
      and{' '}
      <Link className={styles.link} to="/privacy">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
