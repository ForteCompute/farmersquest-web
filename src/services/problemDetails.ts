// Parses RFC 7807 problem-details responses (and ASP.NET validation problem-details) from the API
// into a shape the UI can render: a single human-facing message plus a map of field name to error.
//
// Every API response is untrusted input, so this narrows defensively from `unknown` and never
// assumes a shape. It does no business logic; it only reshapes server-provided error text for
// display. Field keys are normalised to the client's camelCase field names (the API returns the
// command property names, e.g. "Email", "FullName", "Nin").

export type FieldErrors = Record<string, string>;

export interface ParsedProblem {
  /** A safe, user-facing summary message. */
  message: string;
  /** Field name (camelCase) to a combined error message for that field. */
  fieldErrors: FieldErrors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// "Email" -> "email", "FullName" -> "fullName", "request.Nin" -> "nin", "$.password" -> "password".
function normaliseFieldKey(key: string): string {
  const last = key.split('.').pop() ?? key;
  const cleaned = last.replace(/[^A-Za-z0-9]/g, '');
  if (cleaned.length === 0) {
    return '';
  }
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

function collectMessages(value: unknown): string {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').join(' ');
  }
  if (typeof value === 'string') {
    return value;
  }
  return '';
}

export function parseProblemDetails(body: unknown, fallbackMessage: string): ParsedProblem {
  const fieldErrors: FieldErrors = {};
  let message = fallbackMessage;

  if (isRecord(body)) {
    const errors = body.errors;
    if (isRecord(errors)) {
      for (const [rawKey, rawValue] of Object.entries(errors)) {
        const text = collectMessages(rawValue);
        if (!text) {
          continue;
        }
        const key = normaliseFieldKey(rawKey);
        if (key) {
          fieldErrors[key] = fieldErrors[key] ? `${fieldErrors[key]} ${text}` : text;
        } else {
          // Errors not tied to a field contribute to the summary message.
          message = text;
        }
      }
    }

    // Prefer a specific detail/title over the fallback when no top-level message was set yet.
    if (message === fallbackMessage) {
      const detail = typeof body.detail === 'string' ? body.detail.trim() : '';
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      if (detail) {
        message = detail;
      } else if (title) {
        message = title;
      }
    }
  }

  return { message, fieldErrors };
}
