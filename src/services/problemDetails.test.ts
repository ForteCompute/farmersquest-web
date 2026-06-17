import { describe, expect, it } from 'vitest';
import { parseProblemDetails } from './problemDetails';

// The parser only reshapes server-provided error text for display; these tests pin that mapping,
// including the defensive handling of untrusted shapes.
describe('parseProblemDetails', () => {
  it('maps validation errors to camelCase field names and combines messages', () => {
    const body = {
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: {
        Email: ['Email is already registered.'],
        Password: ['Too short.', 'Needs a number.'],
        Nin: ['NIN is invalid.'],
      },
    };

    const result = parseProblemDetails(body, 'fallback');

    expect(result.fieldErrors).toEqual({
      email: 'Email is already registered.',
      password: 'Too short. Needs a number.',
      nin: 'NIN is invalid.',
    });
  });

  it('takes the last path segment for nested field keys', () => {
    const result = parseProblemDetails(
      { errors: { 'request.FullName': ['Required.'] } },
      'fallback',
    );
    expect(result.fieldErrors).toEqual({ fullName: 'Required.' });
  });

  it('uses detail then title for the message when there are no field errors', () => {
    expect(parseProblemDetails({ detail: 'Account is locked.' }, 'fallback').message).toBe(
      'Account is locked.',
    );
    expect(parseProblemDetails({ title: 'Bad Request' }, 'fallback').message).toBe('Bad Request');
  });

  it('routes field-less errors into the summary message', () => {
    const result = parseProblemDetails({ errors: { '': ['Something failed.'] } }, 'fallback');
    expect(result.message).toBe('Something failed.');
    expect(result.fieldErrors).toEqual({});
  });

  it('falls back safely for non-object or empty bodies', () => {
    expect(parseProblemDetails(undefined, 'Generic error.')).toEqual({
      message: 'Generic error.',
      fieldErrors: {},
    });
    expect(parseProblemDetails('not json', 'Generic error.').message).toBe('Generic error.');
  });
});
