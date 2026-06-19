import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Checkbox, FigmaIcon, Input, PasswordInput } from '@/design-system';
import { useSession } from '@/app/session';
import { homePathForRole } from '@/app/navigation';
import { mapApiRole } from '@/app/roles';
import { login as loginRequest } from '@/services/auth';
import { AuthLayout } from './AuthLayout';
import { AuthLegal } from './AuthLegal';
import styles from './SignInScreen.module.css';

// The sign-in screen. Posts the email-or-username and password to the login endpoint, then routes to
// the role home. On bad credentials it shows one generic message and never reveals which field was
// wrong: the API does not say, and we would not surface it if it did.
const GENERIC_CREDENTIALS_ERROR = 'Incorrect username or password. Please try again.';

export function SignInScreen() {
  const navigate = useNavigate();
  const { signIn } = useSession();

  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isValid = loginValue.trim() !== '' && password !== '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || submitting) return;

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
        <h1 className={styles.title}>Sign in to your account</h1>
        <p className={styles.subtitle}>Enter your email and password to continue.</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && (
          <p className={styles.banner} role="alert">
            {error}
          </p>
        )}

        <Input
          label="Email or username"
          placeholder="you@example.com"
          autoComplete="username"
          leadingIcon={<FigmaIcon name="email" size={24} />}
          value={loginValue}
          onChange={(e) => {
            setLoginValue(e.target.value);
            if (error) setError(null);
          }}
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          leadingIcon={<FigmaIcon name="password" size={24} />}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
        />

        <div className={styles.row}>
          <Checkbox
            label="Remember me"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <Link className={styles.link} to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <Button
          className={styles.submit}
          type="submit"
          fullWidth
          disabled={!isValid}
          loading={submitting}
          loadingLabel="Signing in"
        >
          {submitting ? 'Signing in' : 'Sign in'}
        </Button>
      </form>

      <p className={styles.signUpRow}>
        Don&rsquo;t have an account?{' '}
        <Link className={styles.link} to="/register">
          Create one
        </Link>
      </p>

      <AuthLegal action="signing in" />
    </AuthLayout>
  );
}
