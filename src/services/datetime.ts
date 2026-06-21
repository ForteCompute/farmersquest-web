// Date and time formatting for display only. The API supplies ISO timestamps (UTC) and plain dates;
// this turns them into readable Nigerian-locale text for the screen. Presentation only: no parsing of
// business meaning, and an unparseable value yields null so the UI can simply omit it.

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};
const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

function parse(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// A plain date such as the expected delivery date (YYYY-MM-DD), shown without a time.
export function formatDate(value: string | null | undefined, locale = 'en-NG'): string | null {
  const date = parse(value);
  return date ? new Intl.DateTimeFormat(locale, DATE_OPTIONS).format(date) : null;
}

// A timestamp such as when an order was placed, shown with the time.
export function formatDateTime(value: string | null | undefined, locale = 'en-NG'): string | null {
  const date = parse(value);
  return date ? new Intl.DateTimeFormat(locale, DATE_TIME_OPTIONS).format(date) : null;
}

// Today's date as YYYY-MM-DD, for the minimum of a date input so a past expected date cannot be
// chosen. The API is still the authority and rejects a past date.
export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
