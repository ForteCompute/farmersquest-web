import { describe, expect, it } from 'vitest';
import { buildFullName, isValidEmail, validateRegister } from './registerValidation';

const valid = {
  firstName: 'Ada',
  surname: 'Obi',
  email: 'ada@example.com',
  password: 'password123',
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

describe('validateRegister', () => {
  it('passes a complete form', () => {
    expect(validateRegister(valid)).toEqual({});
  });

  it('flags every missing required field', () => {
    const errors = validateRegister({ firstName: '', surname: '', email: '', password: '' });
    expect(errors.firstName).toBeDefined();
    expect(errors.surname).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  it('rejects an invalid email and a short password', () => {
    const errors = validateRegister({ ...valid, email: 'nope', password: 'short' });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  it('does not collect or require a NIN', () => {
    // NIN is not part of registration; verification happens later at /sell/verify.
    expect('nin' in validateRegister({ ...valid, email: '' })).toBe(false);
  });
});
