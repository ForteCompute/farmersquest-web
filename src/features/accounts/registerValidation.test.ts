import { describe, expect, it } from 'vitest';
import { buildFullName, isValidEmail, validateRegisterCore } from './registerValidation';

const valid = {
  firstName: 'Ada',
  surname: 'Obi',
  email: 'ada@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

describe('buildFullName', () => {
  it('joins and collapses whitespace', () => {
    expect(buildFullName(' Ada ', ' Obi ')).toBe('Ada Obi');
    expect(buildFullName('Ada', '')).toBe('Ada');
  });
});

describe('isValidEmail', () => {
  it('accepts a normal address and rejects malformed ones', () => {
    expect(isValidEmail('ada@example.com')).toBe(true);
    expect(isValidEmail('ada@')).toBe(false);
    expect(isValidEmail('ada example.com')).toBe(false);
  });
});

describe('validateRegisterCore', () => {
  it('passes a complete form', () => {
    expect(validateRegisterCore(valid)).toEqual({});
  });

  it('flags every missing required field', () => {
    const errors = validateRegisterCore({
      firstName: '',
      surname: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(errors.firstName).toBeDefined();
    expect(errors.surname).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.confirmPassword).toBeDefined();
  });

  it('rejects an invalid email and a short password', () => {
    const errors = validateRegisterCore({
      ...valid,
      email: 'nope',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  it('requires the confirmation to match the password', () => {
    expect(validateRegisterCore({ ...valid, confirmPassword: 'different' }).confirmPassword).toBe(
      'Passwords do not match.',
    );
  });

  it('does not collect or require a NIN or username', () => {
    const errors = validateRegisterCore(valid);
    expect('nin' in errors).toBe(false);
    expect('username' in errors).toBe(false);
  });
});
