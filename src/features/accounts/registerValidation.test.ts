import { describe, expect, it } from 'vitest';
import { buildFullName, isValidEmail, validateRegister } from './registerValidation';

const valid = {
  firstName: 'Ada',
  surname: 'Obi',
  email: 'ada@example.com',
  password: 'password123',
  nin: '12345678901',
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
  it('passes a complete buyer form with no NIN required', () => {
    expect(validateRegister({ ...valid, nin: '' }, { requireNin: false })).toEqual({});
  });

  it('flags every missing required buyer field', () => {
    const errors = validateRegister(
      { firstName: '', surname: '', email: '', password: '', nin: '' },
      { requireNin: false },
    );
    expect(errors.firstName).toBeDefined();
    expect(errors.surname).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.nin).toBeUndefined();
  });

  it('rejects an invalid email and a short password', () => {
    const errors = validateRegister(
      { ...valid, email: 'nope', password: 'short' },
      { requireNin: false },
    );
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  it('requires an 11-digit NIN for farmers', () => {
    expect(validateRegister({ ...valid, nin: '' }, { requireNin: true }).nin).toBeDefined();
    expect(validateRegister({ ...valid, nin: '123' }, { requireNin: true }).nin).toBeDefined();
    expect(validateRegister(valid, { requireNin: true })).toEqual({});
  });
});
