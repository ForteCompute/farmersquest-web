import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, NigeriaFlag } from '@/design-system';
import { AuthLayout } from './AuthLayout';
import styles from './wizard.module.css';

// "Your Phone Number" step from the CREATE ACCOUNT frames (default and filled states). This is a
// visual-only preview: the contract has no phone verification endpoint yet, so Send Code is inert.
// The local input state only demonstrates the empty (disabled) and filled (enabled) button states.
export function VerifyPhoneScreen() {
  const navigate = useNavigate();
  const [number, setNumber] = useState('');

  return (
    <AuthLayout onBack={() => navigate(-1)}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Phone Number</h1>
        <p className={styles.subtitle}>We will send you a code to keep your account safe.</p>
      </header>

      <div className={styles.body}>
        <div className={styles.phoneControl}>
          <span className={styles.phonePrefix}>
            <NigeriaFlag size={18} />
            +234
          </span>
          <input
            className={styles.phoneInput}
            type="tel"
            inputMode="tel"
            aria-label="Phone number"
            placeholder="801 234 5678"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>

        <Button className={styles.continue} fullWidth disabled={number.trim() === ''}>
          Send Code
        </Button>
      </div>

      <p className={styles.footer}>
        By clicking &ldquo;Continue&rdquo;, I have read and agree with the Term Sheet and Privacy
        Policy
      </p>
    </AuthLayout>
  );
}
