import { useId } from 'react';
import type { InputHTMLAttributes, Ref } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Helper text shown under the field. */
  hint?: string;
  /** Error message; when set, the field renders in its error state. */
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

// A labelled text input with hint and error states, wired for accessibility (label association,
// aria-invalid, aria-describedby). Styling is token driven.
export function Input({ label, hint, error, id, className, ref, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={[styles.field, className ?? ''].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={[styles.input, error ? styles.inputError : ''].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
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
