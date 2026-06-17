import { Button, CheckIcon } from '@/design-system';
import styles from './AuthSuccess.module.css';

// The success state from the verification frames: a title, a green check medallion with a light
// confetti scatter, a confirmation message, and a single action. Decorative confetti is fixed (no
// randomness) so renders are deterministic.
export interface AuthSuccessProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

const CONFETTI = [
  { top: '8%', left: '18%', color: 'var(--fq-color-green-action)', rotate: '20deg' },
  { top: '2%', left: '54%', color: 'var(--fq-color-price)', rotate: '-15deg' },
  { top: '14%', left: '82%', color: 'var(--fq-color-danger)', rotate: '35deg' },
  { top: '40%', left: '6%', color: 'var(--fq-color-green-button)', rotate: '-25deg' },
  { top: '44%', left: '90%', color: 'var(--fq-color-price)', rotate: '12deg' },
  { top: '72%', left: '12%', color: 'var(--fq-color-danger)', rotate: '-30deg' },
  { top: '78%', left: '78%', color: 'var(--fq-color-green-action)', rotate: '18deg' },
  { top: '88%', left: '46%', color: 'var(--fq-color-price)', rotate: '-10deg' },
];

export function AuthSuccess({ title, message, actionLabel, onAction }: AuthSuccessProps) {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.medallionWrap}>
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className={styles.confetti}
            style={{
              top: c.top,
              left: c.left,
              backgroundColor: c.color,
              transform: `rotate(${c.rotate})`,
            }}
          />
        ))}
        <span className={styles.medallion}>
          <CheckIcon size={56} />
        </span>
      </div>

      <p className={styles.message}>{message}</p>

      <Button className={styles.action} fullWidth onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
