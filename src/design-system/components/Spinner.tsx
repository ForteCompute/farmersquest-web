import styles from './Spinner.module.css';

export interface SpinnerProps {
  /** Pixel size. Defaults to 22, sized to sit inside a primary button. */
  size?: number;
  /** Accessible label announced to assistive tech. Defaults to "Loading". */
  label?: string;
}

// A spinning loading indicator, used inside buttons and on loading states. Inherits currentColor so
// it shows white on a primary button and green elsewhere.
export function Spinner({ size = 22, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  );
}
