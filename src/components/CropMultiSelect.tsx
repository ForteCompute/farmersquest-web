import { useEffect, useId, useState } from 'react';
import { cropVocabulary, getCategories } from '@/services/catalog';
import styles from './CropMultiSelect.module.css';

// A controlled multi-select for "What you grow or raise". The options come from the catalog category
// vocabulary (the same list the storefront browse uses), never hardcoded. The farmer toggles the
// produce and livestock they handle; the selected values are sent as the account's crops. Rendered
// as an accessible group of toggle chips (each a button with aria-pressed), keyboard friendly.
export interface CropMultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  hint?: string;
  error?: string;
}

export function CropMultiSelect({
  value,
  onChange,
  label = 'What you grow or raise',
  hint,
  error,
}: CropMultiSelectProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const hintId = useId();
  const errorId = useId();

  useEffect(() => {
    let active = true;
    void getCategories().then((r) => {
      if (!active) return;
      if (r.ok) {
        setOptions(cropVocabulary(r.data));
        setStatus('ok');
      } else {
        setStatus('error');
      }
    });
    return () => {
      active = false;
    };
  }, []);

  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  }

  const describedBy =
    [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset className={styles.field} aria-describedby={describedBy}>
      <legend className={styles.label}>{label}</legend>
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}

      {status === 'loading' ? (
        <span className={styles.note}>Loading options...</span>
      ) : status === 'error' ? (
        <span className={styles.note}>We could not load the list. Please try again.</span>
      ) : (
        <div className={styles.options}>
          {options.map((option) => {
            const selected = value.includes(option);
            return (
              <button
                key={option}
                type="button"
                className={[styles.chip, selected ? styles.chipSelected : ''].join(' ')}
                aria-pressed={selected}
                onClick={() => toggle(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
}
