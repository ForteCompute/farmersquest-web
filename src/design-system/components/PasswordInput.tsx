import { useState } from 'react';
import type { Ref } from 'react';
import { Input, type InputProps } from './Input';
import { EyeIcon, EyeOffIcon } from '../icons';
import styles from './PasswordInput.module.css';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'trailingAdornment'> {
  ref?: Ref<HTMLInputElement>;
  /** Accessible label for the show/hide control. Defaults to "Show password" / "Hide password". */
  toggleLabel?: { show: string; hide: string };
}

// A password field with the spec's show/hide eye on the right. Built on Input so it inherits the
// filled style, leading icon, label, hint, and error handling. All other Input props (including the
// leading icon and ref) flow straight through.
export function PasswordInput({ toggleLabel, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const labels = toggleLabel ?? { show: 'Show password', hide: 'Hide password' };

  return (
    <Input
      type={visible ? 'text' : 'password'}
      trailingAdornment={
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? labels.hide : labels.show}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
      {...rest}
    />
  );
}
