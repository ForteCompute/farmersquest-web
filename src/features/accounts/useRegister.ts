import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/app/session';
import { homePathForRole } from '@/app/navigation';
import { mapApiRole, type Role } from '@/app/roles';
import { login as loginRequest, type AccountDto, type Result } from '@/services/auth';
import type { FieldErrors } from '@/services/problemDetails';
import { buildFullName, validateRegisterCore, type RegisterCoreValues } from './registerValidation';

// Shared controller for the buyer and farmer registration forms. It owns the common fields and the
// register then sign-in then route-home flow, while each form owns its own extra fields. This keeps
// the two forms distinct (different fields and payloads) without duplicating the submission logic.
//
// Server field errors are mapped onto the matching form field; the surname/first-name pair maps from
// the contract's fullName, and the caller's extra field keys pass through. Anything unrecognised is
// folded into a general message so no server error is dropped.
const EMPTY: RegisterCoreValues = {
  firstName: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export interface RegisterCore {
  fullName: string;
  email: string;
  password: string;
}

function mapServerErrors(
  serverErrors: FieldErrors,
  extraKeys: string[],
): { errors: FieldErrors; general: string | null } {
  const errors: FieldErrors = {};
  const leftover: string[] = [];
  for (const [key, value] of Object.entries(serverErrors)) {
    if (key === 'email' || key === 'password') {
      errors[key] = value;
    } else if (key === 'fullName') {
      errors.firstName = value;
    } else if (extraKeys.includes(key)) {
      errors[key] = value;
    } else {
      leftover.push(value);
    }
  }
  return { errors, general: leftover.length ? leftover.join(' ') : null };
}

export function useRegister(role: Role, extraKeys: string[] = []) {
  const navigate = useNavigate();
  const { signIn } = useSession();

  const [values, setValues] = useState<RegisterCoreValues>(EMPTY);
  const [shownErrors, setShownErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const liveErrors = validateRegisterCore(values);
  const coreValid = Object.keys(liveErrors).length === 0;

  function update<K extends keyof RegisterCoreValues>(field: K, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setShownErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    if (generalError) setGeneralError(null);
  }

  // Surface a field's error once the user leaves it, for fast inline feedback.
  function blur<K extends keyof RegisterCoreValues>(field: K) {
    setShownErrors((prev) => ({ ...prev, [field]: liveErrors[field] ?? '' }));
  }

  // Clear an extra field's error and any general error as the user edits.
  function clearFieldError(key: string) {
    setShownErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
    if (generalError) setGeneralError(null);
  }

  // Runs the flow: validate, register via the caller's doRegister, then sign in and route home.
  // extraErrors lets a form gate on its own required fields (for example the farmer's phone).
  async function submit(
    doRegister: (core: RegisterCore) => Promise<Result<AccountDto>>,
    extraErrors: FieldErrors = {},
  ) {
    if (submitting) return;

    const blockingExtras = Object.fromEntries(
      Object.entries(extraErrors).filter(([, message]) => message),
    );
    if (!coreValid || Object.keys(blockingExtras).length > 0) {
      setShownErrors({ ...liveErrors, ...blockingExtras });
      return;
    }

    setSubmitting(true);
    setShownErrors({});
    setGeneralError(null);

    const core: RegisterCore = {
      fullName: buildFullName(values.firstName, values.surname),
      email: values.email.trim(),
      password: values.password,
    };

    const registration = await doRegister(core);
    if (!registration.ok) {
      setSubmitting(false);
      const mapped = mapServerErrors(registration.error.fieldErrors, extraKeys);
      setShownErrors(mapped.errors);
      setGeneralError(
        mapped.general ??
          (Object.keys(mapped.errors).length === 0 ? registration.error.message : null),
      );
      return;
    }

    // Account created; sign in so the user lands in the app.
    const auth = await loginRequest({ login: core.email, password: core.password });
    if (!auth.ok) {
      setSubmitting(false);
      setGeneralError('Your account was created. Please sign in to continue.');
      return;
    }

    signIn(auth.data);
    const nextRole = mapApiRole(auth.data.account?.role) ?? role;
    navigate(homePathForRole(nextRole), { replace: true });
  }

  return {
    values,
    shownErrors,
    generalError,
    submitting,
    coreValid,
    update,
    blur,
    clearFieldError,
    submit,
  };
}
