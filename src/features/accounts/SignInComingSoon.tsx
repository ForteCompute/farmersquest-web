import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import styles from './SignInComingSoon.module.css';

// Temporary destination for the "Sign-In Instead" link until FQ-22 builds the sign-in screen, which
// replaces the /sign-in route with the real screen and removes this placeholder.
export function SignInComingSoon() {
  return (
    <AuthLayout>
      <p className={styles.message}>
        Sign in is coming soon.{' '}
        <Link className={styles.link} to="/register/buyer">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
