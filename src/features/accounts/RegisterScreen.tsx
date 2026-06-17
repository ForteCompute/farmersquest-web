import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  FacebookLogo,
  GoogleLogo,
  IdCardIcon,
  Input,
  LockIcon,
  MailIcon,
  PasswordInput,
} from '@/design-system';
import { useSession } from '@/app/session';
import { homePathForRole } from '@/app/navigation';
import { mapApiRole, type Role } from '@/app/roles';
import { login as loginRequest, registerBuyer, registerFarmer } from '@/services/auth';
import type { FieldErrors } from '@/services/problemDetails';
import { AuthLayout } from './AuthLayout';
import { buildFullName, validateRegister, type RegisterValues } from './registerValidation';
import styles from './RegisterScreen.module.css';

// The Create Your Account screen, reproduced from the CREATE ACCOUNT frame. One component serves the
// buyer and farmer variants: the farmer adds the required NIN field. It posts to the matching
// register endpoint, then signs the new account in and routes to the role home; a new farmer lands
// unverified and sees the verification-pending message on their home.
//
// Per the contract, only fields the register commands accept are collected. The frame's Farm Name,
// Your Crops, State and Region have no endpoint fields yet (tracked as an API gap), so they are not
// shown. The social buttons and terms link are non-functional, matching the frame chrome.
export interface RegisterScreenProps {
  role: Role;
}

const EMPTY: RegisterValues = { firstName: '', surname: '', email: '', password: '', nin: '' };

// Maps API problem-details field keys to this form's fields, folding anything we do not render into
// a general message so no server error is silently dropped.
function mapServerErrors(serverErrors: FieldErrors): {
  errors: FieldErrors;
  general: string | null;
} {
  const errors: FieldErrors = {};
  const leftover: string[] = [];
  for (const [key, value] of Object.entries(serverErrors)) {
    if (key === 'email' || key === 'password' || key === 'nin') {
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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof RegisterValues>(field: K, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    if (generalError) {
      setGeneralError(null);
    }
  }

  const requiredFilled =
    values.firstName.trim() !== '' &&
    values.surname.trim() !== '' &&
    values.email.trim() !== '' &&
    values.password !== '' &&
    (!isFarmer || values.nin.trim() !== '');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const clientErrors = validateRegister(values, { requireNin: isFarmer });
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    const fullName = buildFullName(values.firstName, values.surname);
    const email = values.email.trim();

    const registration = isFarmer
      ? await registerFarmer({ email, fullName, password: values.password, nin: values.nin.trim() })
      : await registerBuyer({ email, fullName, password: values.password });

    if (!registration.ok) {
      setSubmitting(false);
      const mapped = mapServerErrors(registration.error.fieldErrors);
      setErrors(mapped.errors);
      setGeneralError(
        mapped.general ??
          (Object.keys(mapped.errors).length === 0 ? registration.error.message : null),
      );
      return;
    }

    // Account created; sign the user in so they land in the app, per the ticket.
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
        <h1 className={styles.title}>Create Your Account</h1>
        <p className={styles.subtitle}>You must enter your information in the boxes below</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {generalError && (
          <p className={styles.banner} role="alert">
            {generalError}
          </p>
        )}

        <div className={styles.nameRow}>
          <Input
            label="First Name"
            labelHidden
            placeholder="First Name"
            autoComplete="given-name"
            value={values.firstName}
            error={errors.firstName || ''}
            onChange={(e) => update('firstName', e.target.value)}
          />
          <Input
            label="Surname"
            labelHidden
            placeholder="Surname"
            autoComplete="family-name"
            value={values.surname}
            error={errors.surname || ''}
            onChange={(e) => update('surname', e.target.value)}
          />
        </div>

        <Input
          label="E-mail"
          labelHidden
          type="email"
          inputMode="email"
          placeholder="E-mail"
          autoComplete="email"
          leadingIcon={<MailIcon />}
          value={values.email}
          error={errors.email || ''}
          onChange={(e) => update('email', e.target.value)}
        />

        <PasswordInput
          label="Password"
          labelHidden
          placeholder="Password"
          autoComplete="new-password"
          leadingIcon={<LockIcon />}
          value={values.password}
          error={errors.password || ''}
          onChange={(e) => update('password', e.target.value)}
        />

        {isFarmer && (
          <Input
            label="NIN (National Identification Number)"
            labelHidden
            inputMode="numeric"
            placeholder="NIN"
            autoComplete="off"
            leadingIcon={<IdCardIcon />}
            value={values.nin}
            error={errors.nin || ''}
            hint="Your 11-digit National Identification Number. Used to verify your farm."
            onChange={(e) => update('nin', e.target.value)}
          />
        )}

        <Button type="submit" fullWidth disabled={!requiredFilled || submitting}>
          {submitting ? 'Creating account...' : 'Continue'}
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

      <p className={styles.signInRow}>
        Already have an account?{' '}
        <Link className={styles.link} to="/sign-in">
          Sign-In Instead
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

      <p className={styles.terms}>
        By clicking &ldquo;Continue&rdquo;, I have read and agree with the{' '}
        <span className={styles.termsLink}>Term Sheet and Privacy Policy</span>
      </p>
    </AuthLayout>
  );
}
