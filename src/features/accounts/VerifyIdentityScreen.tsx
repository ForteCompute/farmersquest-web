import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CarIcon, CheckCircleIcon, IdCardIcon, UserCheckIcon } from '@/design-system';
import { AuthLayout } from './AuthLayout';
import styles from './wizard.module.css';

// "Verify Identity" step from the CREATE ACCOUNT frame: choose a verification document. Visual-only
// preview, since the contract has no KYC document endpoint yet; the selection is local state and
// Continue is inert. National ID is selected by default, matching the frame.
type DocId = 'nin' | 'voter' | 'license';

interface DocOption {
  id: DocId;
  title: string;
  description: string;
  icon: typeof IdCardIcon;
  iconClass: string | undefined;
}

const OPTIONS: DocOption[] = [
  {
    id: 'nin',
    title: 'National ID (NIN)',
    description: 'Fastest verification via NIMC',
    icon: IdCardIcon,
    iconClass: styles.iconNeutral,
  },
  {
    id: 'voter',
    title: "Voter's Card",
    description: 'PVC Issued by INEC',
    icon: UserCheckIcon,
    iconClass: styles.iconGreen,
  },
  {
    id: 'license',
    title: "Driver's License",
    description: 'Standard FRSC License',
    icon: CarIcon,
    iconClass: styles.iconRed,
  },
];

export function VerifyIdentityScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<DocId>('nin');

  return (
    <AuthLayout onBack={() => navigate(-1)}>
      <header className={styles.header}>
        <h1 className={styles.title}>Verify Identity</h1>
        <p className={styles.subtitle}>Choose your Verification document</p>
      </header>

      <div className={styles.body}>
        <div className={styles.optionList} role="radiogroup" aria-label="Verification document">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = option.id === selected;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={[styles.option, isSelected ? styles.optionSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSelected(option.id)}
              >
                <span className={[styles.optionIcon, option.iconClass].filter(Boolean).join(' ')}>
                  <Icon size={22} />
                </span>
                <span className={styles.optionText}>
                  <span className={styles.optionTitle}>{option.title}</span>
                  <span className={styles.optionDesc}>{option.description}</span>
                </span>
                {isSelected ? (
                  <span className={styles.radio}>
                    <CheckCircleIcon size={22} />
                  </span>
                ) : (
                  <span className={styles.radioEmpty} />
                )}
              </button>
            );
          })}
        </div>

        <Button className={styles.continue} fullWidth>
          Continue
        </Button>
      </div>

      <p className={styles.footer}>
        Your data is encrypted and only used for identity verification. We never share your personal
        documents with buyers.
      </p>
    </AuthLayout>
  );
}
