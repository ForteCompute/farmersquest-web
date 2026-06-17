import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FigmaIcon, Input, OtpInput, PasswordInput, Spinner } from '@/design-system';
import { requestPasswordReset, resetPassword } from '@/services/auth';
import { isValidEmail } from './registerValidation';
import { AuthLayout } from './AuthLayout';
import { AuthSuccess } from './AuthSuccess';
import styles from './ForgotPasswordScreen.module.css';

// The forgot-password flow from the FORGOT PASSWORD frames, stepping request -> confirm -> sign-in
// prompt:
//  1. request:  enter email, post password-reset/request to send a code.
//  2. code:     enter the 5-digit code (the reset token); resend is gated by a countdown.
//  3. password: set the new password, post password-reset/confirm with the token.
//  4. done:     success, with a Back To Sign In action.
// The code step advances locally because the contract has no verify-only endpoint; the token is
// validated by the confirm call, whose error surfaces on the new-password step.
type Step = 'request' | 'code' | 'password' | 'done';

const CODE_LENGTH = 5;
const RESEND_SECONDS = 34;
const MIN_PASSWORD_LENGTH = 8;

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
          title="Password Changed"
          message="Your password has successfully been changed!"
          actionLabel="Back To Sign In"
          onAction={goToSignIn}
        />
      </AuthLayout>
    );
  }

  if (step === 'request') {
    return (
      <AuthLayout onBack={goToSignIn}>
        <header className={styles.header}>
          <h1 className={styles.title}>Forgot Password?</h1>
          <p className={styles.subtitle}>
            Please type your email to get a confirmation code to set a new password
          </p>
        </header>
        <form className={styles.form} onSubmit={handleRequest} noValidate>
          <Input
            label="E-mail"
            labelHidden
            type="email"
            inputMode="email"
            placeholder="E-mail"
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
            disabled={email.trim() === '' || submitting}
          >
            {submitting ? <Spinner label="Sending" /> : 'Confirm Email'}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  if (step === 'code') {
    return (
      <AuthLayout onBack={() => setStep('request')}>
        <header className={styles.header}>
          <h1 className={styles.title}>Verify Your Email</h1>
          <p className={styles.subtitle}>
            Verification code has been sent to <span className={styles.email}>{email}</span>
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
            Confirm Code
          </Button>
          <p className={styles.resendRow}>
            <span className={styles.countdown}>{formatCountdown(secondsLeft)}</span>{' '}
            <button
              type="button"
              className={styles.resend}
              onClick={handleResend}
              disabled={secondsLeft > 0}
            >
              Resend Confirmation Code
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
        <h1 className={styles.title}>New Password</h1>
        <p className={styles.subtitle}>Type your new password in the boxes below</p>
      </header>
      <form className={styles.form} onSubmit={handleSetPassword} noValidate>
        {error && (
          <p className={styles.banner} role="alert">
            {error}
          </p>
        )}
        <PasswordInput
          label="Password"
          labelHidden
          placeholder="Password"
          autoComplete="new-password"
          leadingIcon={<FigmaIcon name="password" size={24} />}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
        />
        <PasswordInput
          label="Confirm Password"
          labelHidden
          placeholder="Confirm Password"
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
          disabled={password === '' || confirm === '' || submitting}
        >
          {submitting ? <Spinner label="Saving" /> : 'Confirm'}
        </Button>
      </form>
    </AuthLayout>
  );
}
