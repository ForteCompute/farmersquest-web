import { useId } from 'react';
import type { InputHTMLAttributes, Ref } from 'react';
import { CheckIcon } from '../icons';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  ref?: Ref<HTMLInputElement>;
}

// A square checkbox with a green check, per the spec. The native input is visually hidden but drives
// state and accessibility; the visible box mirrors the checked state.
export function Checkbox({ label, id, className, ref, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label className={[styles.wrap, className ?? ''].filter(Boolean).join(' ')} htmlFor={inputId}>
      <input ref={ref} id={inputId} type="checkbox" className={styles.input} {...rest} />
      <span className={styles.box} aria-hidden="true">
        <CheckIcon size={14} />
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
}
