import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FigmaIcon, Input, OtpInput, PasswordInput } from '@/design-system';
import { requestPasswordReset, resetPassword } from '@/services/auth';
import { isValidEmail, MIN_PASSWORD_LENGTH } from './registerValidation';
import { AuthLayout } from './AuthLayout';
import { AuthSuccess } from './AuthSuccess';
import styles from './ForgotPasswordScreen.module.css';

// The forgot-password flow, stepping request -> code -> new password -> done:
//  1. request:  enter email, post password-reset/request to send a code.
//  2. code:     enter the reset code (the token); resend is gated by a countdown.
//  3. password: set the new password, post password-reset/confirm with the token.
//  4. done:     success, with a Back To Sign In action.
// The code step advances locally because the contract has no verify-only endpoint; the token is
// validated by the confirm call, whose error surfaces on the new-password step.
type Step = 'request' | 'code' | 'password' | 'done';

const CODE_LENGTH = 5;
const RESEND_SECONDS = 34;

function formatCountdown(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const id = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  function goToSignIn() {
    navigate('/sign-in');
  }

  async function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await requestPasswordReset({ email: email.trim() });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setSecondsLeft(RESEND_SECONDS);
    setStep('code');
  }

  async function handleResend() {
    if (secondsLeft > 0) {
      return;
    }
    setSecondsLeft(RESEND_SECONDS);
    setError(null);
    await requestPasswordReset({ email: email.trim() });
  }

  function handleConfirmCode() {
    if (code.length < CODE_LENGTH) {
      return;
    }
    // No verify-only endpoint; the token is checked by the confirm call on the next step.
    setError(null);
    setStep('password');
  }

  async function handleSetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await resetPassword({ token: code, newPassword: password });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setStep('done');
  }

  if (step === 'done') {
    return (
      <AuthLayout>
        <AuthSuccess
          title="Password changed"
          message="Your password has been changed successfully."
          actionLabel="Back to sign in"
          onAction={goToSignIn}
        />
      </AuthLayout>
    );
  }

  if (step === 'request') {
    return (
      <AuthLayout onBack={goToSignIn}>
        <header className={styles.header}>
          <h1 className={styles.title}>Forgot password?</h1>
          <p className={styles.subtitle}>
            Enter your email and we will send a code to reset your password.
          </p>
        </header>
        <form className={styles.form} onSubmit={handleRequest} noValidate>
          <Input
            label="Email address"
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            autoComplete="email"
            leadingIcon={<FigmaIcon name="email" size={24} />}
            value={email}
            error={error || ''}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
          />
          <Button
            className={styles.submit}
            type="submit"
            fullWidth
            disabled={email.trim() === ''}
            loading={submitting}
            loadingLabel="Sending code"
          >
            {submitting ? 'Sending code' : 'Send reset code'}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  if (step === 'code') {
    return (
      <AuthLayout onBack={() => setStep('request')}>
        <header className={styles.header}>
          <h1 className={styles.title}>Verify your email</h1>
          <p className={styles.subtitle}>
            We sent a code to <span className={styles.email}>{email}</span>
          </p>
        </header>
        <div className={styles.form}>
          <OtpInput
            label="Verification code"
            length={CODE_LENGTH}
            value={code}
            error={error || ''}
            onChange={(next) => {
              setCode(next);
              if (error) setError(null);
            }}
          />
          <Button
            className={styles.submit}
            fullWidth
            disabled={code.length < CODE_LENGTH}
            onClick={handleConfirmCode}
          >
            Confirm code
          </Button>
          <p className={styles.resendRow}>
            <span className={styles.countdown}>{formatCountdown(secondsLeft)}</span>{' '}
            <button
              type="button"
              className={styles.resend}
              onClick={handleResend}
              disabled={secondsLeft > 0}
            >
              Resend code
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // step === 'password'
  return (
    <AuthLayout onBack={() => setStep('code')}>
      <header className={styles.header}>
        <h1 className={styles.title}>New password</h1>
        <p className={styles.subtitle}>Choose a new password for your account.</p>
      </header>
      <form className={styles.form} onSubmit={handleSetPassword} noValidate>
        {error && (
          <p className={styles.banner} role="alert">
            {error}
          </p>
        )}
        <PasswordInput
          label="New password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          leadingIcon={<FigmaIcon name="password" size={24} />}
          value={password}
          hint="Use at least 8 characters."
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
        />
        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          leadingIcon={<FigmaIcon name="password" size={24} />}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (error) setError(null);
          }}
        />
        <Button
          className={styles.submit}
          type="submit"
          fullWidth
          disabled={password === '' || confirm === ''}
          loading={submitting}
          loadingLabel="Saving"
        >
          {submitting ? 'Saving' : 'Change password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
