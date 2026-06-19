import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { SessionProvider } from '@/app/session';
import { routes } from '@/app/router';
import type { AccountDto, AuthResultDto } from '@/services/auth';

// The two registration forms talk to the API only through the auth and catalog services, which we
// mock. We assert the distinct fields, that no username or NIN is collected, confirm-password
// validation, and the register then sign-in then route-home flow for each role.
vi.mock('@/services/auth', () => ({
  registerBuyer: vi.fn(),
  registerFarmer: vi.fn(),
  login: vi.fn(),
  getMe: vi.fn(),
}));
vi.mock('@/services/catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/catalog')>();
  return { ...actual, getStates: vi.fn(), getCategories: vi.fn() };
});

import { getMe, login, registerBuyer, registerFarmer } from '@/services/auth';
import { getCategories, getStates } from '@/services/catalog';

const mockRegisterBuyer = vi.mocked(registerBuyer);
const mockRegisterFarmer = vi.mocked(registerFarmer);
const mockLogin = vi.mocked(login);

function account(overrides: Partial<AccountDto> = {}): AccountDto {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'ada@example.com',
    username: 'ada',
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

async function fillCore(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('First name'), 'Ada');
  await user.type(screen.getByPlaceholderText('Surname'), 'Obi');
  await user.type(screen.getByPlaceholderText('you@example.com'), 'ada@example.com');
  await user.type(screen.getByPlaceholderText('At least 8 characters'), 'password123');
  await user.type(screen.getByPlaceholderText('Re-enter your password'), 'password123');
}

beforeEach(() => {
  try {
    window.localStorage?.clear?.();
  } catch {
    // Best effort.
  }
  vi.mocked(getMe).mockResolvedValue({ ok: false, error: { message: 'x', fieldErrors: {} } });
  vi.mocked(getStates).mockResolvedValue({
    ok: true,
    data: [
      { code: 'LA', name: 'Lagos' },
      { code: 'OY', name: 'Oyo' },
    ],
  });
  // The crops multi-select sources its options from the catalog category vocabulary (leaf names).
  vi.mocked(getCategories).mockResolvedValue({
    ok: true,
    data: [
      {
        id: 'c1',
        slug: 'crops',
        name: 'Crops',
        children: [
          { id: 'c2', slug: 'grains', name: 'Grains and Cereals' },
          { id: 'c3', slug: 'tubers', name: 'Tubers and Roots' },
        ],
      },
    ],
  });
});

afterEach(() => vi.clearAllMocks());

describe('BuyerRegisterScreen', () => {
  it('shows the buyer fields and no NIN, username, or phone field', () => {
    renderAt('/register/buyer');
    expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument();
    expect(screen.getByLabelText('State')).toBeInTheDocument();
    expect(screen.getByLabelText('Region or town')).toBeInTheDocument();
    expect(screen.queryByLabelText(/NIN/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
  });

  it('blocks submit when the confirmation does not match', async () => {
    const user = userEvent.setup();
    renderAt('/register/buyer');
    await user.type(screen.getByPlaceholderText('First name'), 'Ada');
    await user.type(screen.getByPlaceholderText('Surname'), 'Obi');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'ada@example.com');
    await user.type(screen.getByPlaceholderText('At least 8 characters'), 'password123');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'different');
    await user.tab();
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
    expect(mockRegisterBuyer).not.toHaveBeenCalled();
  });

  it('registers a buyer without a username and routes to the buyer home', async () => {
    const user = userEvent.setup();
    mockRegisterBuyer.mockResolvedValue({ ok: true, data: account() });
    mockLogin.mockResolvedValue({ ok: true, data: authResult(account()) });

    renderAt('/register/buyer');
    await fillCore(user);
    await user.selectOptions(screen.getByLabelText('State'), 'Lagos');
    await user.type(screen.getByLabelText('Region or town'), 'Ikeja');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByRole('heading', { name: /Welcome to FarmersQuest/i }),
    ).toBeInTheDocument();
    const body = mockRegisterBuyer.mock.calls[0]![0];
    expect(body).toMatchObject({
      email: 'ada@example.com',
      fullName: 'Ada Obi',
      password: 'password123',
      state: 'Lagos',
      region: 'Ikeja',
    });
    expect(body).not.toHaveProperty('username');
  });
});

describe('FarmerRegisterScreen', () => {
  it('shows the farmer fields, a crops multi-select from the catalog, and no NIN or username', async () => {
    renderAt('/register/farmer');
    expect(screen.getByLabelText('Phone number')).toBeInTheDocument();
    expect(screen.getByLabelText('Farm name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument();
    // "What you grow or raise" is a catalog-sourced multi-select, not a free-text field.
    expect(screen.getByText('What you grow or raise')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Grains and Cereals' })).toBeInTheDocument();
    expect(screen.queryByLabelText(/NIN/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
  });

  it('registers a farmer with phone and selected crops, no username or NIN, and lands on the farmer home', async () => {
    const user = userEvent.setup();
    const farmer = account({ role: 'Farmer', verificationStatus: 'NotSubmitted' });
    mockRegisterFarmer.mockResolvedValue({ ok: true, data: farmer });
    mockLogin.mockResolvedValue({ ok: true, data: authResult(farmer) });

    renderAt('/register/farmer');
    await fillCore(user);
    await user.type(screen.getByLabelText('Phone number'), '08030000000');
    await user.type(screen.getByLabelText('Farm name'), 'Obi Farms');
    await user.click(await screen.findByRole('button', { name: 'Grains and Cereals' }));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/verify your identity to start selling/i)).toBeInTheDocument();
    const body = mockRegisterFarmer.mock.calls[0]![0];
    expect(body).toMatchObject({
      email: 'ada@example.com',
      fullName: 'Ada Obi',
      password: 'password123',
      phoneNumber: '08030000000',
      farmName: 'Obi Farms',
      crops: ['Grains and Cereals'],
    });
    expect(body).not.toHaveProperty('username');
    expect(body).not.toHaveProperty('nin');
  });
});
