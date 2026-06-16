import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the full width of the container. */
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

// The core action control. Variants and sizes map to design tokens; no colours or spacing are
// hardcoded in the styles.
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
