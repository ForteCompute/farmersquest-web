import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Checkbox,
  FacebookLogo,
  GoogleLogo,
  Input,
  LockIcon,
  MailIcon,
  PasswordInput,
  Spinner,
} from '@/design-system';
import { useSession } from '@/app/session';
import { homePathForRole } from '@/app/navigation';
import { mapApiRole } from '@/app/roles';
import { login as loginRequest } from '@/services/auth';
import { AuthLayout } from './AuthLayout';
import styles from './SignInScreen.module.css';

// The Sign In To Your Account screen, reproduced from the SIGN IN frames. Posts to the login
// endpoint with the email-or-username and password, then routes to the role home. On bad
// credentials it shows one generic message and never reveals which field was wrong.
//
// A generic message is intentional: the API does not tell us, and we would not surface it if it did.
const GENERIC_CREDENTIALS_ERROR = 'Incorrect username or password. Try again';

export function SignInScreen() {
  const navigate = useNavigate();
  const { signIn } = useSession();

  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = loginValue.trim() !== '' && password !== '' && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await loginRequest({ login: loginValue.trim(), password });
    if (!result.ok) {
      // One generic error regardless of the server response; do not reveal which field failed.
      setSubmitting(false);
      setError(GENERIC_CREDENTIALS_ERROR);
      return;
    }

    signIn(result.data, remember);
    const role = mapApiRole(result.data.account?.role) ?? 'buyer';
    navigate(homePathForRole(role), { replace: true });
  }

  return (
    <AuthLayout>
      <header className={styles.header}>
        <h1 className={styles.title}>Sign In To Your Account</h1>
        <p className={styles.subtitle}>To sign in you must enter your email and password below</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="Email or username"
          labelHidden
          placeholder="Email or username"
          autoComplete="username"
          leadingIcon={<MailIcon />}
          value={loginValue}
          onChange={(e) => {
            setLoginValue(e.target.value);
            if (error) setError(null);
          }}
        />

        <div className={styles.passwordGroup}>
          <PasswordInput
            label="Password"
            labelHidden
            placeholder="Password"
            autoComplete="current-password"
            leadingIcon={<LockIcon />}
            value={password}
            error={error || ''}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>

        <div className={styles.row}>
          <Checkbox
            label="Remember me"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <Link className={styles.link} to="/forgot-password">
            Forgot Password?
          </Link>
        </div>

        <Button className={styles.submit} type="submit" fullWidth disabled={!canSubmit}>
          {submitting ? <Spinner label="Signing in" /> : 'Continue'}
        </Button>
      </form>

      <div className={styles.social} aria-hidden="true">
        <button type="button" className={styles.socialButton} disabled title="Coming soon">
          <GoogleLogo />
        </button>
        <button type="button" className={styles.socialButton} disabled title="Coming soon">
          <FacebookLogo />
        </button>
      </div>

      <p className={styles.signUpRow}>
        Don&rsquo;t have an account?{' '}
        <Link className={styles.link} to="/register/buyer">
          Create one
        </Link>
      </p>

      <p className={styles.terms}>
        By clicking &ldquo;Continue&rdquo;, I have read and agree with the{' '}
        <span className={styles.termsLink}>Term Sheet and Privacy Policy</span>
      </p>
    </AuthLayout>
  );
}
