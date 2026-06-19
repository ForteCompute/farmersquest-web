import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider, useSession } from '@/app/session';
import type { AccountDto } from '@/services/auth';
import { KycVerifyScreen } from './KycVerifyScreen';

// The screen talks to the API only through submitKyc, which we mock; the rest of the auth service
// stays real (the header uses logout). The catalog calls in the header degrade to empty in tests.
vi.mock('@/services/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/auth')>();
  return { ...actual, submitKyc: vi.fn() };
});

import { submitKyc } from '@/services/auth';

const mockSubmitKyc = vi.mocked(submitKyc);

function farmer(overrides: Partial<AccountDto> = {}): AccountDto {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'ada@example.com',
    username: 'ada',
    fullName: 'Ada Obi',
    role: 'Farmer',
    phoneNumber: '08030000000',
    status: 'Active',
    verificationStatus: 'NotSubmitted',
    createdAtUtc: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// Signs the given account into the real session (in memory) before rendering its children, so the
// screen sees an authenticated farmer and updateAccount drives a real re-render.
function Seed({ account, children }: { account: AccountDto; children: ReactNode }) {
  const { signIn } = useSession();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    signIn({ accessToken: 'token-123', account });
    setReady(true);
  }, [account, signIn]);
  return ready ? <>{children}</> : null;
}

function renderScreen(account: AccountDto) {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={['/sell/verify']}>
        <Seed account={account}>
          <Routes>
            <Route path="/sell/verify" element={<KycVerifyScreen />} />
            <Route path="/farmer" element={<div>Farmer home</div>} />
            <Route path="/sign-in" element={<div>Sign in</div>} />
          </Routes>
        </Seed>
      </MemoryRouter>
    </SessionProvider>,
  );
}

function image(name: string) {
  return new File(['x'], name, { type: 'image/png' });
}

// jsdom does not implement object URLs, which the image preview uses.
beforeAll(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:mock'),
    writable: true,
  });
  Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true });
});

afterEach(() => vi.clearAllMocks());

describe('KycVerifyScreen', () => {
  it('submits the identity and documents as a multipart payload, then shows the review state', async () => {
    const user = userEvent.setup();
    mockSubmitKyc.mockResolvedValue({
      ok: true,
      data: farmer({ verificationStatus: 'PendingReview' }),
    });

    renderScreen(farmer({ verificationStatus: 'NotSubmitted' }));

    // Step 1: identity details.
    await screen.findByLabelText('Date of birth');
    fireEvent.change(screen.getByLabelText('Date of birth'), { target: { value: '1990-05-20' } });
    await user.type(screen.getByLabelText(/NIN/i), '12345678901');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2: documents.
    fireEvent.change(screen.getByLabelText('Front of ID'), {
      target: { files: [image('front.png')] },
    });
    fireEvent.change(screen.getByLabelText('Back of ID'), {
      target: { files: [image('back.png')] },
    });
    fireEvent.change(screen.getByLabelText('Your photo'), { target: { files: [image('me.png')] } });
    await user.click(screen.getByRole('button', { name: /submit for verification/i }));

    expect(mockSubmitKyc).toHaveBeenCalledTimes(1);
    const input = mockSubmitKyc.mock.calls[0]![0];
    expect(input).toMatchObject({ documentType: 0, nin: '12345678901', dateOfBirth: '1990-05-20' });
    expect(input.frontImage).toBeInstanceOf(File);
    expect(input.backImage).toBeInstanceOf(File);
    expect(input.photo).toBeInstanceOf(File);

    expect(await screen.findByText(/verification in review/i)).toBeInTheDocument();
  });

  it('blocks step one until the NIN and date of birth are valid', async () => {
    const user = userEvent.setup();
    renderScreen(farmer({ verificationStatus: 'NotSubmitted' }));

    await user.type(await screen.findByLabelText(/NIN/i), '123');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/NIN should be 11 digits/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your date of birth/i)).toBeInTheDocument();
    // Still on step one; the document fields are not shown.
    expect(screen.queryByLabelText('Front of ID')).not.toBeInTheDocument();
  });

  it('shows the review state and no form when already pending', async () => {
    renderScreen(farmer({ verificationStatus: 'PendingReview' }));
    expect(await screen.findByText(/verification in review/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/NIN/i)).not.toBeInTheDocument();
  });

  it('shows the verified state when already verified', async () => {
    renderScreen(farmer({ verificationStatus: 'Verified' }));
    expect(await screen.findByText(/you are verified/i)).toBeInTheDocument();
  });
});
