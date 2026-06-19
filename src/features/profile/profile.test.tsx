import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { SessionProvider } from '@/app/session';
import { routes } from '@/app/router';
import type { AccountDto, AuthResultDto } from '@/services/auth';

vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  updateNotificationPreferences: vi.fn(),
}));
vi.mock('@/services/catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/catalog')>();
  return { ...actual, getStates: vi.fn() };
});

import {
  changePassword,
  getMe,
  login,
  updateNotificationPreferences,
  updateProfile,
} from '@/services/auth';
import { getStates } from '@/services/catalog';

const mockLogin = vi.mocked(login);
const mockGetMe = vi.mocked(getMe);
const mockUpdateProfile = vi.mocked(updateProfile);
const mockChangePassword = vi.mocked(changePassword);
const mockUpdateNotificationPreferences = vi.mocked(updateNotificationPreferences);

function account(overrides: Partial<AccountDto> = {}): AccountDto {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'ada@example.com',
    username: 'ada',
    fullName: 'Ada Obi',
    role: 'Buyer',
    phoneNumber: '08030000000',
    status: 'Active',
    verificationStatus: null,
    notificationPreferences: { email: true, sms: false, whatsApp: false },
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

const user = userEvent.setup();

async function signInAndOpenProfile(acc: AccountDto) {
  mockLogin.mockResolvedValue({ ok: true, data: authResult(acc) });
  mockGetMe.mockResolvedValue({ ok: true, data: acc });
  render(
    <SessionProvider>
      <MemoryRouter initialEntries={['/sign-in']}>
        <MountedRoutes />
      </MemoryRouter>
    </SessionProvider>,
  );
  await user.type(screen.getByLabelText('Email or username'), 'ada');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: /^sign in$/i }));
  await screen.findByRole('heading', { name: /FarmersQuest/i });
  await user.click(screen.getByRole('link', { name: /profile/i }));
  await screen.findByRole('heading', { name: /your account/i });
}

beforeEach(() => {
  try {
    window.localStorage?.clear?.();
  } catch {
    // Best effort.
  }
  vi.mocked(getStates).mockResolvedValue({
    ok: true,
    data: [
      { code: 'LA', name: 'Lagos' },
      { code: 'OY', name: 'Oyo' },
    ],
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProfileScreen', () => {
  it('prompts an unverified farmer to verify and shows no verified badge', async () => {
    await signInAndOpenProfile(
      account({ role: 'Farmer', fullName: 'Musa Bello', verificationStatus: 'NotSubmitted' }),
    );

    // The name shows both in the shell header and on the profile.
    expect(screen.getAllByText('Musa Bello').length).toBeGreaterThan(0);
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText(/verify your identity to start selling/i)).toBeInTheDocument();
    expect(screen.queryByText('Verified farmer')).not.toBeInTheDocument();
  });

  it('shows pending review without the verify prompt once submitted', async () => {
    await signInAndOpenProfile(account({ role: 'Farmer', verificationStatus: 'PendingReview' }));
    expect(screen.getAllByText(/pending verification/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/verify your identity to start selling/i)).not.toBeInTheDocument();
  });
});

describe('EditProfileScreen', () => {
  it('saves the profile through PUT /me', async () => {
    await signInAndOpenProfile(account());
    mockUpdateProfile.mockResolvedValue({ ok: true, data: account({ fullName: 'Ada N. Obi' }) });

    await user.click(screen.getByRole('link', { name: /edit profile/i }));
    const name = await screen.findByLabelText('Full name');
    await user.clear(name);
    await user.type(name, 'Ada N. Obi');
    // State is a select fed by the catalog reference endpoint, not a free-text field.
    await user.selectOptions(await screen.findByLabelText('State'), 'Lagos');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Ada N. Obi',
        phoneNumber: '08030000000',
        state: 'Lagos',
      }),
    );
    expect(await screen.findByText(/your profile has been saved/i)).toBeInTheDocument();
  });
});

describe('SecurityScreen', () => {
  it('confirms before changing the password and posts the change', async () => {
    await signInAndOpenProfile(account());
    mockChangePassword.mockResolvedValue({ ok: true, data: null });

    await user.click(screen.getByRole('link', { name: /security & password/i }));
    await user.type(await screen.findByLabelText('Current password'), 'oldpassword1');
    await user.type(screen.getByLabelText('New password'), 'newpassword1');
    await user.type(screen.getByLabelText('Confirm new password'), 'newpassword1');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    // A confirmation dialog gates the sensitive change.
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /change password/i }));

    expect(mockChangePassword).toHaveBeenCalledWith({
      currentPassword: 'oldpassword1',
      newPassword: 'newpassword1',
    });
    expect(await screen.findByText(/your password has been changed/i)).toBeInTheDocument();
  });
});

describe('NotificationsScreen', () => {
  it('saves notification preferences through PUT /me/notification-preferences', async () => {
    await signInAndOpenProfile(account());
    mockUpdateNotificationPreferences.mockResolvedValue({ ok: true, data: account() });

    await user.click(screen.getByRole('link', { name: /notifications/i }));
    await user.click(await screen.findByLabelText('SMS'));
    await user.click(screen.getByRole('button', { name: /save preferences/i }));

    expect(mockUpdateNotificationPreferences).toHaveBeenCalledWith({
      email: true,
      sms: true,
      whatsApp: false,
    });
    expect(await screen.findByText(/preferences have been saved/i)).toBeInTheDocument();
  });
});
