import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, PhoneIcon } from '@/design-system';
import { registerFarmer } from '@/services/auth';
import { AuthLayout } from './AuthLayout';
import { AuthLegal } from './AuthLegal';
import { RegisterCoreFields } from './RegisterCoreFields';
import { useRegister } from './useRegister';
import styles from './register.module.css';

// The farmer registration form: First name, Surname, Email, Password, Confirm password, Phone
// number, Farm name, and Your crops. No NIN: identity verification (KYC) happens later at
// /sell/verify. No username is collected; the API derives it from the email.
//
// Phone is required because the registration API requires it for farmers. Farm name and crops are
// free text: the API accepts them as labels and has no reference list to choose from, so they are
// captured as typed rather than invented. Crops are entered comma separated and sent as a list.
export function FarmerRegisterScreen() {
  const reg = useRegister('farmer', ['phoneNumber', 'farmName', 'crops']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [farmName, setFarmName] = useState('');
  const [crops, setCrops] = useState('');

  const phoneFilled = phoneNumber.trim() !== '';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void reg.submit(
      (core) =>
        registerFarmer({
          email: core.email,
          fullName: core.fullName,
          password: core.password,
          phoneNumber: phoneNumber.trim(),
          farmName: farmName.trim() || null,
          crops: crops
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
        }),
      { phoneNumber: phoneFilled ? '' : 'Enter your phone number.' },
    );
  }

  return (
    <AuthLayout>
      <header className={styles.header}>
        <h1 className={styles.title}>Create your farmer account</h1>
        <p className={styles.subtitle}>
          Start selling your crops and livestock to buyers across Nigeria.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {reg.generalError && (
          <p className={styles.banner} role="alert">
            {reg.generalError}
          </p>
        )}

        <RegisterCoreFields
          values={reg.values}
          errors={reg.shownErrors}
          update={reg.update}
          blur={reg.blur}
        />

        <Input
          label="Phone number"
          type="tel"
          inputMode="tel"
          placeholder="08030000000"
          autoComplete="tel"
          leadingIcon={<PhoneIcon />}
          value={phoneNumber}
          error={reg.shownErrors.phoneNumber || ''}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
            reg.clearFieldError('phoneNumber');
          }}
        />

        <Input
          label="Farm name"
          placeholder="Your farm or business name"
          value={farmName}
          error={reg.shownErrors.farmName || ''}
          onChange={(e) => {
            setFarmName(e.target.value);
            reg.clearFieldError('farmName');
          }}
        />

        <Input
          label="Your crops"
          placeholder="Maize, Cassava, Yam"
          hint="Separate crops with a comma."
          value={crops}
          error={reg.shownErrors.crops || ''}
          onChange={(e) => {
            setCrops(e.target.value);
            reg.clearFieldError('crops');
          }}
        />

        <Button
          type="submit"
          fullWidth
          disabled={!reg.coreValid || !phoneFilled}
          loading={reg.submitting}
          loadingLabel="Creating account"
        >
          {reg.submitting ? 'Creating account' : 'Create account'}
        </Button>
      </form>

      <p className={styles.signInRow}>
        Already have an account?{' '}
        <Link className={styles.link} to="/sign-in">
          Sign in
        </Link>
      </p>
      <p className={styles.switchRow}>
        Buying instead?{' '}
        <Link className={styles.link} to="/register/buyer">
          Create a buyer account
        </Link>
      </p>

      <AuthLegal action="creating an account" />
    </AuthLayout>
  );
}
