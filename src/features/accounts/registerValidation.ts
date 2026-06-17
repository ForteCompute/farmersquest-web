import type { FieldErrors } from '@/services/problemDetails';

// Client-side validation for the registration form. This is presentation logic only: it catches
// obvious mistakes for fast feedback. The API re-validates everything and is the sole authority;
// its field errors are surfaced alongside these.

export interface RegisterValues {
  firstName: string;
  surname: string;
  email: string;
  password: string;
  /** Only collected for farmers. */
  nin: string;
}

// Minimum password length we hint at client-side. The server enforces the real policy.
const MIN_PASSWORD_LENGTH = 8;

// A Nigerian NIN is 11 digits. We check shape only; the API verifies the number itself.
const NIN_PATTERN = /^\d{11}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

// Combines the two name boxes from the frame into the single fullName the contract accepts.
export function buildFullName(firstName: string, surname: string): string {
  return `${firstName} ${surname}`.replace(/\s+/g, ' ').trim();
}

export function validateRegister(
  values: RegisterValues,
  options: { requireNin: boolean },
): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'Enter your first name.';
  }
  if (!values.surname.trim()) {
    errors.surname = 'Enter your surname.';
  }
  if (!values.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.password) {
    errors.password = 'Enter a password.';
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (options.requireNin) {
    if (!values.nin.trim()) {
      errors.nin = 'Enter your NIN.';
    } else if (!NIN_PATTERN.test(values.nin.trim())) {
      errors.nin = 'Your NIN should be 11 digits.';
    }
  }

  return errors;
}
