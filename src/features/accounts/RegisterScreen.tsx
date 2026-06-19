import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, FigmaIcon, Input, PasswordInput } from '@/design-system';
import { useSession } from '@/app/session';
import { homePathForRole } from '@/app/navigation';
import { mapApiRole, ROLE_LABELS, type Role } from '@/app/roles';
import { login as loginRequest, registerBuyer, registerFarmer } from '@/services/auth';
import type { FieldErrors } from '@/services/problemDetails';
import { AuthLayout } from './AuthLayout';
import { AuthLegal } from './AuthLegal';
import { buildFullName, validateRegister, type RegisterValues } from './registerValidation';
import styles from './RegisterScreen.module.css';

// The create-account screen. One component serves the buyer and farmer variants. It posts to the
// matching register endpoint, then signs the new account in and routes to the role home.
//
// NIN is NOT collected here: a farmer registers without it and completes identity verification (KYC)
// later, inside the app at /sell/verify. A new farmer lands Pending and is prompted to verify.
//
// Only fields the register commands accept are collected. The legal line links the real Terms and
// Privacy pages. Social sign-up is not offered until it has a backend.
export interface RegisterScreenProps {
  role: Role;
}

const EMPTY: RegisterValues = { firstName: '', surname: '', email: '', password: '' };

// Maps API problem-details field keys to this form's fields, folding anything we do not render into
// a general message so no server error is silently dropped.
function mapServerErrors(serverErrors: FieldErrors): {
  errors: FieldErrors;
  general: string | null;
} {
  const errors: FieldErrors = {};
  const leftover: string[] = [];
  for (const [key, value] of Object.entries(serverErrors)) {
    if (key === 'email' || key === 'password') {
      errors[key] = value;
    } else if (key === 'fullName') {
      errors.firstName = value;
    } else {
      leftover.push(value);
    }
  }
  return { errors, general: leftover.length ? leftover.join(' ') : null };
}

export function RegisterScreen({ role }: RegisterScreenProps) {
  const isFarmer = role === 'farmer';
  const navigate = useNavigate();
  const { signIn } = useSession();

  const [values, setValues] = useState<RegisterValues>(EMPTY);
  const [shownErrors, setShownErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const liveErrors = validateRegister(values);
  const isValid = Object.keys(liveErrors).length === 0;

  function update<K extends keyof RegisterValues>(field: K, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setShownErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    if (generalError) setGeneralError(null);
  }

  // Surface a field's error once the user leaves it, for fast inline feedback.
  function blur<K extends keyof RegisterValues>(field: K) {
    setShownErrors((prev) => ({ ...prev, [field]: liveErrors[field] ?? '' }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!isValid) {
      setShownErrors(liveErrors);
      return;
    }

    setSubmitting(true);
    setShownErrors({});
    setGeneralError(null);

    const fullName = buildFullName(values.firstName, values.surname);
    const email = values.email.trim();

    // Farmers register without a NIN; KYC is collected later at /sell/verify.
    const registration = isFarmer
      ? await registerFarmer({ email, fullName, password: values.password })
      : await registerBuyer({ email, fullName, password: values.password });

    if (!registration.ok) {
      setSubmitting(false);
      const mapped = mapServerErrors(registration.error.fieldErrors);
      setShownErrors(mapped.errors);
      setGeneralError(
        mapped.general ??
          (Object.keys(mapped.errors).length === 0 ? registration.error.message : null),
      );
      return;
    }

    // Account created; sign the user in so they land in the app.
    const auth = await loginRequest({ login: email, password: values.password });
    if (!auth.ok) {
      setSubmitting(false);
      setGeneralError('Your account was created. Please sign in to continue.');
      return;
    }

    signIn(auth.data);
    const nextRole = mapApiRole(auth.data.account?.role) ?? role;
    navigate(homePathForRole(nextRole), { replace: true });
  }

  return (
    <AuthLayout>
      <header className={styles.header}>
        <h1 className={styles.title}>Create your {ROLE_LABELS[role].toLowerCase()} account</h1>
        <p className={styles.subtitle}>
          {isFarmer
            ? 'Start selling your crops and livestock to buyers across Nigeria.'
            : 'Buy fresh produce and livestock direct from verified farmers.'}
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {generalError && (
          <p className={styles.banner} role="alert">
            {generalError}
          </p>
        )}

        <div className={styles.nameRow}>
          <Input
            label="First name"
            placeholder="First name"
            autoComplete="given-name"
            value={values.firstName}
            error={shownErrors.firstName || ''}
            onChange={(e) => update('firstName', e.target.value)}
            onBlur={() => blur('firstName')}
          />
          <Input
            label="Surname"
            placeholder="Surname"
            autoComplete="family-name"
            value={values.surname}
            error={shownErrors.surname || ''}
            onChange={(e) => update('surname', e.target.value)}
            onBlur={() => blur('surname')}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          autoComplete="email"
          leadingIcon={<FigmaIcon name="email" size={24} />}
          value={values.email}
          error={shownErrors.email || ''}
          onChange={(e) => update('email', e.target.value)}
          onBlur={() => blur('email')}
        />

        <PasswordInput
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          leadingIcon={<FigmaIcon name="password" size={24} />}
          value={values.password}
          error={shownErrors.password || ''}
          hint="Use at least 8 characters."
          onChange={(e) => update('password', e.target.value)}
          onBlur={() => blur('password')}
        />

        <Button
          type="submit"
          fullWidth
          disabled={!isValid}
          loading={submitting}
          loadingLabel="Creating account"
        >
          {submitting ? 'Creating account' : 'Create account'}
        </Button>
      </form>

      <p className={styles.signInRow}>
        Already have an account?{' '}
        <Link className={styles.link} to="/sign-in">
          Sign in
        </Link>
      </p>

      <p className={styles.switchRow}>
        {isFarmer ? (
          <>
            Buying instead?{' '}
            <Link className={styles.link} to="/register/buyer">
              Create a buyer account
            </Link>
          </>
        ) : (
          <>
            Selling on FarmersQuest?{' '}
            <Link className={styles.link} to="/register/farmer">
              Create a farmer account
            </Link>
          </>
        )}
      </p>

      <AuthLegal action="creating an account" />
    </AuthLayout>
  );
}
