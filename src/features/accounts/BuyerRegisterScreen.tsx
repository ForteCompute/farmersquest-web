import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/design-system';
import { ChevronDown } from '@/components/storefront';
import { registerBuyer } from '@/services/auth';
import { getStates, type StateRef } from '@/services/catalog';
import { AuthLayout } from './AuthLayout';
import { AuthLegal } from './AuthLegal';
import { RegisterCoreFields } from './RegisterCoreFields';
import { useRegister } from './useRegister';
import styles from './register.module.css';

// The buyer registration form: First name, Surname, Email, Password, Confirm password, State, and
// Region. The State list comes from the catalog reference endpoint (no hardcoding). Region is a free
// text field: the API has no reference list of regions or towns yet, so it is captured as a label
// rather than invented. No username is collected; the API derives it from the email.
export function BuyerRegisterScreen() {
  const reg = useRegister('buyer', ['state', 'region']);
  const [states, setStates] = useState<StateRef[]>([]);
  const [state, setState] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    let active = true;
    void getStates().then((r) => {
      if (active && r.ok) setStates(r.data);
    });
    return () => {
      active = false;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void reg.submit((core) =>
      registerBuyer({
        email: core.email,
        fullName: core.fullName,
        password: core.password,
        state: state.trim() || null,
        region: region.trim() || null,
      }),
    );
  }

  return (
    <AuthLayout>
      <header className={styles.header}>
        <h1 className={styles.title}>Create your buyer account</h1>
        <p className={styles.subtitle}>
          Buy fresh produce and livestock direct from verified farmers.
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

        <label className={styles.field}>
          <span className={styles.fieldLabel}>State</span>
          <span className={styles.selectWrap}>
            <select value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Select your state</option>
              {states.map((s) => (
                <option key={s.code ?? s.name ?? ''} value={s.name ?? ''}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown size={18} />
          </span>
        </label>

        <Input
          label="Region or town"
          placeholder="Region or town"
          autoComplete="address-level2"
          value={region}
          error={reg.shownErrors.region || ''}
          onChange={(e) => {
            setRegion(e.target.value);
            reg.clearFieldError('region');
          }}
        />

        <Button
          type="submit"
          fullWidth
          disabled={!reg.coreValid}
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
        Selling on FarmersQuest?{' '}
        <Link className={styles.link} to="/register/farmer">
          Create a farmer account
        </Link>
      </p>

      <AuthLegal action="creating an account" />
    </AuthLayout>
  );
}
