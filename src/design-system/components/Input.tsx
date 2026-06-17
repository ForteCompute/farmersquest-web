import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Helper text shown under the field. */
  hint?: string;
  /** Error message; when set, the field renders in its error state. */
  error?: string;
  /** Icon shown inside the field on the left, per the spec's filled inputs. Decorative. */
  leadingIcon?: ReactNode;
  /** Control shown inside the field on the right, e.g. a password show/hide toggle. */
  trailingAdornment?: ReactNode;
  /**
   * Visually hide the label but keep it for assistive tech. The account frames use the placeholder
   * as the visible label, so the real label is hidden while staying accessible.
   */
  labelHidden?: boolean;
  ref?: Ref<HTMLInputElement>;
}

// A labelled text input with hint and error states, wired for accessibility (label association,
// aria-invalid, aria-describedby). Optional leading icon and trailing adornment match the spec's
// filled inputs (left icon, password eye). Styling is token driven.
export function Input({
  label,
  hint,
  error,
  leadingIcon,
  trailingAdornment,
  labelHidden = false,
  id,
  className,
  ref,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={[styles.field, className ?? ''].filter(Boolean).join(' ')}>
      <label
        className={[styles.label, labelHidden ? styles.srOnly : ''].filter(Boolean).join(' ')}
        htmlFor={inputId}
      >
        {label}
      </label>
      <div
        className={[
          styles.control,
          leadingIcon ? styles.hasLeading : '',
          trailingAdornment ? styles.hasTrailing : '',
          error ? styles.controlError : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {leadingIcon && (
          <span className={styles.leading} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {trailingAdornment && <span className={styles.trailing}>{trailingAdornment}</span>}
      </div>
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
