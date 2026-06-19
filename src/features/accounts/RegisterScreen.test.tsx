import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { SessionProvider } from '@/app/session';
import { routes } from '@/app/router';
import type { AccountDto, AuthResultDto } from '@/services/auth';

// The screen talks to the API only through the auth service, so we mock that service and assert the
// screen's behaviour: inline validation, field-error surfacing, NIN never being collected, and the
// register then sign-in then route-home flow. Mounting the real route table asserts navigation.
vi.mock('@/services/auth', () => ({
  registerBuyer: vi.fn(),
  registerFarmer: vi.fn(),
  login: vi.fn(),
  getMe: vi.fn(),
}));

import { getMe, login, registerBuyer, registerFarmer } from '@/services/auth';

const mockRegisterBuyer = vi.mocked(registerBuyer);
const mockRegisterFarmer = vi.mocked(registerFarmer);
const mockLogin = vi.mocked(login);
const mockGetMe = vi.mocked(getMe);

function account(overrides: Partial<AccountDto> = {}): AccountDto {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'ada@example.com',
    username: null,
    fullName: 'Ada Obi',
    role: 'Buyer',
    phoneNumber: null,
    status: 'Active',
    verificationStatus: null,
    createdAtUtc: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function authResult(acc: AccountDto): AuthResultDto {
  return {
    accessToken: 'token-123',
    tokenType: 'Bearer',
    expiresAtUtc: '2026-01-01T01:00:00Z',
    account: acc,
  };
}

function MountedRoutes() {
  return useRoutes(routes);
}

function renderAt(path: string) {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={[path]}>
        <MountedRoutes />
      </MemoryRouter>
    </SessionProvider>,
  );
}

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('First name'), 'Ada');
  await user.type(screen.getByPlaceholderText('Surname'), 'Obi');
  await user.type(screen.getByPlaceholderText('you@example.com'), 'ada@example.com');
  await user.type(screen.getByPlaceholderText('At least 8 characters'), 'password123');
}

beforeEach(() => {
  try {
    window.localStorage?.clear?.();
  } catch {
    // Best effort in the test environment.
  }
  mockGetMe.mockResolvedValue({ ok: false, error: { message: 'x', fieldErrors: {} } });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('RegisterScreen', () => {
  it('shows the account fields and never a NIN field, for buyer or farmer', () => {
    renderAt('/register/buyer');
    expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeInTheDocument();
    expect(screen.queryByLabelText(/NIN/i)).not.toBeInTheDocument();
  });

  it('does not show a NIN field for farmers', () => {
    renderAt('/register/farmer');
    expect(screen.queryByLabelText(/NIN/i)).not.toBeInTheDocument();
  });

  it('keeps the submit disabled until the form is valid', () => {
    renderAt('/register/buyer');
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
  });

  it('shows an inline email error and does not call the API for invalid input', async () => {
    const user = userEvent.setup();
    renderAt('/register/buyer');

    await user.type(screen.getByPlaceholderText('First name'), 'Ada');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'nope');
    // Move focus away from the email field to trigger its blur validation.
    await user.click(screen.getByPlaceholderText('Surname'));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
    expect(mockRegisterBuyer).not.toHaveBeenCalled();
  });

  it('registers a buyer, signs in, and routes to the buyer home', async () => {
    const user = userEvent.setup();
    mockRegisterBuyer.mockResolvedValue({ ok: true, data: account() });
    mockLogin.mockResolvedValue({ ok: true, data: authResult(account()) });

    renderAt('/register/buyer');
    await fill(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByRole('heading', { name: /Welcome to FarmersQuest/i }),
    ).toBeInTheDocument();
    expect(mockRegisterBuyer).toHaveBeenCalledWith({
      email: 'ada@example.com',
      fullName: 'Ada Obi',
      password: 'password123',
    });
    expect(mockLogin).toHaveBeenCalledWith({ login: 'ada@example.com', password: 'password123' });
  });

  it('surfaces an API field error inline', async () => {
    const user = userEvent.setup();
    mockRegisterBuyer.mockResolvedValue({
      ok: false,
      error: {
        message: 'Validation failed.',
        fieldErrors: { email: 'Email is already registered.' },
      },
    });

    renderAt('/register/buyer');
    await fill(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Email is already registered.')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('registers a farmer without a NIN and lands on the farmer home with the KYC banner', async () => {
    const user = userEvent.setup();
    const farmer = account({ role: 'Farmer', verificationStatus: 'Pending' });
    mockRegisterFarmer.mockResolvedValue({ ok: true, data: farmer });
    mockLogin.mockResolvedValue({ ok: true, data: authResult(farmer) });

    renderAt('/register/farmer');
    await fill(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/verify your identity to start selling/i)).toBeInTheDocument();
    expect(mockRegisterFarmer).toHaveBeenCalledWith({
      email: 'ada@example.com',
      fullName: 'Ada Obi',
      password: 'password123',
    });
  });
});
