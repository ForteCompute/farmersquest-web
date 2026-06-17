import { useRef } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import styles from './OtpInput.module.css';

export interface OtpInputProps {
  /** Number of digit boxes. Defaults to 5, matching the frames. */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Accessible group label. */
  label: string;
  /** When set, renders the boxes in their error state. */
  error?: string;
}

// The segmented verification-code input from the frames: a row of single-digit boxes with focus
// management (advance on entry, retreat on backspace, distribute on paste). Controlled: the joined
// digits are reported through onChange.
export function OtpInput({ length = 5, value, onChange, label, error }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  }

  const errorId = error ? `${label.replace(/\s+/g, '-').toLowerCase()}-otp-error` : undefined;

  return (
    <div>
      <div className={styles.row} role="group" aria-label={label} aria-describedby={errorId}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            className={[styles.box, error ? styles.boxError : ''].filter(Boolean).join(' ')}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            aria-label={`${label} digit ${index + 1}`}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
