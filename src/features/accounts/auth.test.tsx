import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { SessionProvider } from '@/app/session';
import { routes } from '@/app/router';
import type { AccountDto, AuthResultDto } from '@/services/auth';

// Sign in, sign out, and password reset all talk to the API through the auth service, which we mock
// here. Mounting the real route table lets us assert navigation outcomes (role home, sign-in).
vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}));

import { login, logout, requestPasswordReset, resetPassword } from '@/services/auth';

const mockLogin = vi.mocked(login);
const mockLogout = vi.mocked(logout);
const mockRequestReset = vi.mocked(requestPasswordReset);
const mockResetPassword = vi.mocked(resetPassword);

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

describe('SignInScreen', () => {
  it('shows one generic error on bad credentials and never reveals the field', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      ok: false,
      error: { message: 'User not found for that email.', fieldErrors: { login: 'No such user.' } },
    });

    renderAt('/sign-in');
    await user.type(screen.getByPlaceholderText('Email or username'), 'ada@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'wrong-pass');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(
      await screen.findByText('Incorrect username or password. Try again'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/No such user/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/User not found/i)).not.toBeInTheDocument();
  });

  it('signs in and routes to the role home', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ ok: true, data: authResult(account()) });

    renderAt('/sign-in');
    await user.type(screen.getByPlaceholderText('Email or username'), 'ada');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(
      await screen.findByRole('heading', { name: /Welcome to FarmersQuest/i }),
    ).toBeInTheDocument();
    expect(mockLogin).toHaveBeenCalledWith({ login: 'ada', password: 'password123' });
  });
});

describe('sign out', () => {
  it('clears the session and returns to sign in', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ ok: true, data: authResult(account()) });
    mockLogout.mockResolvedValue({ ok: true, data: null });

    // Sign in first so the session is authenticated, then sign out from the shell.
    renderAt('/sign-in');
    await user.type(screen.getByPlaceholderText('Email or username'), 'ada');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: /Welcome to FarmersQuest/i });

    await user.click(await screen.findByRole('button', { name: /sign out/i }));

    expect(
      await screen.findByRole('heading', { name: /Sign In To Your Account/i }),
    ).toBeInTheDocument();
    expect(mockLogout).toHaveBeenCalled();
  });
});

describe('ForgotPasswordScreen', () => {
  it('steps from request through confirm to the password-changed success', async () => {
    const user = userEvent.setup();
    mockRequestReset.mockResolvedValue({ ok: true, data: null });
    mockResetPassword.mockResolvedValue({ ok: true, data: null });

    renderAt('/forgot-password');

    // Step 1: request a code.
    await user.type(screen.getByPlaceholderText('E-mail'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /confirm email/i }));
    expect(mockRequestReset).toHaveBeenCalledWith({ email: 'ada@example.com' });

    // Step 2: enter the 5-digit code.
    const group = await screen.findByRole('group', { name: /verification code/i });
    const boxes = within(group).getAllByRole('textbox');
    for (let i = 0; i < 5; i += 1) {
      await user.type(boxes[i] as HTMLElement, String(i + 1));
    }
    await user.click(screen.getByRole('button', { name: /confirm code/i }));

    // Step 3: set the new password.
    expect(await screen.findByRole('heading', { name: /New Password/i })).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Password'), 'newpassword1');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'newpassword1');
    await user.click(screen.getByRole('button', { name: /^confirm$/i }));

    // Step 4: success.
    expect(await screen.findByRole('heading', { name: /Password Changed/i })).toBeInTheDocument();
    expect(mockResetPassword).toHaveBeenCalledWith({ token: '12345', newPassword: 'newpassword1' });
  });

  it('blocks the new password when the confirmation does not match', async () => {
    const user = userEvent.setup();
    mockRequestReset.mockResolvedValue({ ok: true, data: null });

    renderAt('/forgot-password');
    await user.type(screen.getByPlaceholderText('E-mail'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /confirm email/i }));

    const group = await screen.findByRole('group', { name: /verification code/i });
    const boxes = within(group).getAllByRole('textbox');
    for (let i = 0; i < 5; i += 1) {
      await user.type(boxes[i] as HTMLElement, '1');
    }
    await user.click(screen.getByRole('button', { name: /confirm code/i }));

    await screen.findByRole('heading', { name: /New Password/i });
    await user.type(screen.getByPlaceholderText('Password'), 'newpassword1');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'different1');
    await user.click(screen.getByRole('button', { name: /^confirm$/i }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });
});
