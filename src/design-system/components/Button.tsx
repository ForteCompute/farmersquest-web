import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Spinner } from './Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the full width of the container. */
  fullWidth?: boolean;
  /**
   * Loading state: shows a spinner, blocks interaction, and announces busy, while keeping the
   * button's brand colour so it never looks disabled while it is actually working.
   */
  loading?: boolean;
  /** Accessible label announced while loading. Defaults to "Working". */
  loadingLabel?: string;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

// The core action control. Variants and sizes map to design tokens; no colours or spacing are
// hardcoded in the styles. States: normal, hover, disabled (muted, clearly inactive), and loading
// (brand colour with a spinner).
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingLabel = 'Working',
  type = 'button',
  className,
  children,
  disabled,
  ref,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size={20} label={loadingLabel} />}
      {children}
    </button>
  );
}
