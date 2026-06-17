import type { FieldErrors } from '@/services/problemDetails';

// Splits API problem-details field errors into the fields a form renders and a general message for
// anything it does not, so no server error is dropped silently.
export function mapServerToFields(
  serverErrors: FieldErrors,
  known: string[],
): { fields: Record<string, string>; general: string | null } {
  const fields: Record<string, string> = {};
  const leftover: string[] = [];
  for (const [key, value] of Object.entries(serverErrors)) {
    if (known.includes(key)) {
      fields[key] = value;
    } else {
      leftover.push(value);
    }
  }
  return { fields, general: leftover.length ? leftover.join(' ') : null };
}
