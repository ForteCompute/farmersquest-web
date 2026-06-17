import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { SessionProvider } from '@/app/session';
import { routes } from '@/app/router';
import type { AccountDto, AuthResultDto } from '@/services/auth';

// The screen talks to the API only through the auth service, so we mock that service and assert the
// screen's behaviour: inline validation, field-error surfacing, and the register then sign-in then
// route-home flow. Mounting the real route table lets us assert the navigation outcome.
vi.mock('@/services/auth', () => ({
  registerBuyer: vi.fn(),
  registerFarmer: vi.fn(),
  login: vi.fn(),
}));

import { login, registerBuyer, registerFarmer } from '@/services/auth';

const mockRegisterBuyer = vi.mocked(registerBuyer);
const mockRegisterFarmer = vi.mocked(registerFarmer);
const mockLogin = vi.mocked(login);

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

async function fillBuyer(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('First Name'), 'Ada');
  await user.type(screen.getByPlaceholderText('Surname'), 'Obi');
  await user.type(screen.getByPlaceholderText('E-mail'), 'ada@example.com');
  await user.type(screen.getByPlaceholderText('Password'), 'password123');
}

beforeEach(() => {
  try {
    window.localStorage?.clear?.();
  } catch {
    // Best effort in the test environment.
  }
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('RegisterScreen', () => {
  it('shows buyer fields without a NIN field', () => {
    renderAt('/register/buyer');
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('NIN')).not.toBeInTheDocument();
  });

  it('shows the required NIN field for farmers', () => {
    renderAt('/register/farmer');
    expect(screen.getByPlaceholderText('NIN')).toBeInTheDocument();
  });

  it('keeps Continue disabled until the required fields are filled', () => {
    renderAt('/register/buyer');
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('validates inline and does not call the API for invalid input', async () => {
    const user = userEvent.setup();
    renderAt('/register/buyer');

    await user.type(screen.getByPlaceholderText('First Name'), 'Ada');
    await user.type(screen.getByPlaceholderText('Surname'), 'Obi');
    await user.type(screen.getByPlaceholderText('E-mail'), 'nope');
    await user.type(screen.getByPlaceholderText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(mockRegisterBuyer).not.toHaveBeenCalled();
  });

  it('registers a buyer, signs in, and routes to the buyer home', async () => {
    const user = userEvent.setup();
    mockRegisterBuyer.mockResolvedValue({ ok: true, data: account() });
    mockLogin.mockResolvedValue({ ok: true, data: authResult(account()) });

    renderAt('/register/buyer');
    await fillBuyer(user);
    await user.click(screen.getByRole('button', { name: /continue/i }));

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
    await fillBuyer(user);
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText('Email is already registered.')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('lands a new farmer on the farmer home with the verification-pending message', async () => {
    const user = userEvent.setup();
    const farmer = account({ role: 'Farmer', verificationStatus: 'Pending' });
    mockRegisterFarmer.mockResolvedValue({ ok: true, data: farmer });
    mockLogin.mockResolvedValue({ ok: true, data: authResult(farmer) });

    renderAt('/register/farmer');
    await fillBuyer(user);
    await user.type(screen.getByPlaceholderText('NIN'), '12345678901');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/pending verification/i)).toBeInTheDocument();
    expect(mockRegisterFarmer).toHaveBeenCalledWith({
      email: 'ada@example.com',
      fullName: 'Ada Obi',
      password: 'password123',
      nin: '12345678901',
    });
  });
});
