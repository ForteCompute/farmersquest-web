import { FigmaIcon, Input, PasswordInput } from '@/design-system';
import type { FieldErrors } from '@/services/problemDetails';
import type { RegisterCoreValues } from './registerValidation';

// The fields shared by the buyer and farmer registration forms, in the order both forms use them:
// First name and Surname each on their own full-width row, then Email, Password, and Confirm
// password. Presentation only; the owning form drives state through the register controller.
export interface RegisterCoreFieldsProps {
  values: RegisterCoreValues;
  errors: FieldErrors;
  update: (field: keyof RegisterCoreValues, value: string) => void;
  blur: (field: keyof RegisterCoreValues) => void;
}

export function RegisterCoreFields({ values, errors, update, blur }: RegisterCoreFieldsProps) {
  return (
    <>
      <Input
        label="First name"
        placeholder="First name"
        autoComplete="given-name"
        value={values.firstName}
        error={errors.firstName || ''}
        onChange={(e) => update('firstName', e.target.value)}
        onBlur={() => blur('firstName')}
      />
      <Input
        label="Surname"
        placeholder="Surname"
        autoComplete="family-name"
        value={values.surname}
        error={errors.surname || ''}
        onChange={(e) => update('surname', e.target.value)}
        onBlur={() => blur('surname')}
      />
      <Input
        label="Email address"
        type="email"
        inputMode="email"
        placeholder="you@example.com"
        autoComplete="email"
        leadingIcon={<FigmaIcon name="email" size={24} />}
        value={values.email}
        error={errors.email || ''}
        onChange={(e) => update('email', e.target.value)}
        onBlur={() => blur('email')}
      />
      <PasswordInput
        label="Password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        leadingIcon={<FigmaIcon name="password" size={24} />}
        value={values.password}
        error={errors.password || ''}
        hint="Use at least 8 characters."
        onChange={(e) => update('password', e.target.value)}
        onBlur={() => blur('password')}
      />
      <PasswordInput
        label="Confirm password"
        placeholder="Re-enter your password"
        autoComplete="new-password"
        leadingIcon={<FigmaIcon name="password" size={24} />}
        value={values.confirmPassword}
        error={errors.confirmPassword || ''}
        onChange={(e) => update('confirmPassword', e.target.value)}
        onBlur={() => blur('confirmPassword')}
      />
    </>
  );
}
