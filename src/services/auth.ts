import { apiClient } from './api';
import type { components } from './api';
import { parseProblemDetails, type ParsedProblem } from './problemDetails';

// Presentation-layer service for the Accounts endpoints. It wraps the typed client, returning a
// discriminated result so screens never touch the network shape directly. There is no business
// logic here: it sends the request and reshapes success or problem-details for the UI. The API is
// the sole authority on validation, authentication, and verification.

export type AccountDto = components['schemas']['AccountDto'];
export type AuthResultDto = components['schemas']['AuthResultDto'];
export type RegisterBuyerInput = components['schemas']['RegisterBuyerCommand'];
export type RegisterFarmerInput = components['schemas']['RegisterFarmerCommand'];
export type LoginInput = components['schemas']['LoginCommand'];
export type RequestPasswordResetInput = components['schemas']['RequestPasswordResetCommand'];
export type ResetPasswordInput = components['schemas']['ResetPasswordCommand'];
export type UpdateProfileInput = components['schemas']['UpdateProfileCommand'];
export type ChangePasswordInput = components['schemas']['ChangePasswordCommand'];
export type NotificationPreferences = components['schemas']['NotificationPreferencesDto'];
export type UpdateNotificationPreferencesInput =
  components['schemas']['UpdateNotificationPreferencesCommand'];

// The KYC submission carries binary files, so it is posted as multipart, not JSON. documentType is
// the IdDocumentType enum (0 NIN, 1 Voter's Card, 2 Driver's License).
export interface SubmitKycInput {
  documentType: number;
  nin: string;
  dateOfBirth: string;
  frontImage: File;
  backImage: File;
  photo: File;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ParsedProblem };

// A safe, generic fallback shown when the server gives no usable message or the request never
// completes. Never surfaces technical detail.
const GENERIC_ERROR = 'Something went wrong. Please try again.';

function failure(body: unknown, fallback = GENERIC_ERROR): { ok: false; error: ParsedProblem } {
  return { ok: false, error: parseProblemDetails(body, fallback) };
}

export async function registerBuyer(input: RegisterBuyerInput): Promise<Result<AccountDto>> {
  try {
    const { data, error } = await apiClient.POST('/api/v1/accounts/register/buyer', {
      body: input,
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function registerFarmer(input: RegisterFarmerInput): Promise<Result<AccountDto>> {
  try {
    const { data, error } = await apiClient.POST('/api/v1/accounts/register/farmer', {
      body: input,
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

// Submit the signed-in farmer's KYC. Sent as multipart/form-data because it carries image files; the
// API returns the updated account (verificationStatus moves to PendingReview). Farmer-only and
// re-checked server-side; the documents and NIN are encrypted at rest and never logged by the API.
export async function submitKyc(input: SubmitKycInput): Promise<Result<AccountDto>> {
  try {
    const { data, error } = await apiClient.POST('/api/v1/accounts/me/kyc', {
      body: input as unknown as components['schemas']['SubmitKycForm'],
      bodySerializer: () => {
        const formData = new FormData();
        formData.append('documentType', String(input.documentType));
        formData.append('nin', input.nin);
        formData.append('dateOfBirth', input.dateOfBirth);
        formData.append('frontImage', input.frontImage);
        formData.append('backImage', input.backImage);
        formData.append('photo', input.photo);
        return formData;
      },
    });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function login(input: LoginInput): Promise<Result<AuthResultDto>> {
  try {
    const { data, error } = await apiClient.POST('/api/v1/accounts/login', { body: input });
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function requestPasswordReset(
  input: RequestPasswordResetInput,
): Promise<Result<null>> {
  try {
    const { error } = await apiClient.POST('/api/v1/accounts/password-reset/request', {
      body: input,
    });
    if (error) {
      return failure(error);
    }
    return { ok: true, data: null };
  } catch {
    return failure(undefined);
  }
}

export async function resetPassword(input: ResetPasswordInput): Promise<Result<null>> {
  try {
    const { error } = await apiClient.POST('/api/v1/accounts/password-reset/confirm', {
      body: input,
    });
    if (error) {
      return failure(error);
    }
    return { ok: true, data: null };
  } catch {
    return failure(undefined);
  }
}

// The /me endpoints act on the authenticated user only; the token identifies who that is, so a user
// can only ever read or change their own account. The API re-checks this on every call.
export async function getMe(): Promise<Result<AccountDto>> {
  try {
    const { data, error } = await apiClient.GET('/api/v1/accounts/me');
    if (error || !data) {
      return failure(error);
    }
    return { ok: true, data };
  } catch {
    return failure(undefined);
  }
}

export async function updateProfile(input: UpdateProfileInput): Promise<Result<AccountDto | null>> {
  try {
    const { data, error } = await apiClient.PUT('/api/v1/accounts/me', { body: input });
    if (error) {
      return failure(error);
    }
    return { ok: true, data: data ?? null };
  } catch {
    return failure(undefined);
  }
}

export async function changePassword(input: ChangePasswordInput): Promise<Result<null>> {
  try {
    const { error } = await apiClient.POST('/api/v1/accounts/me/change-password', { body: input });
    if (error) {
      return failure(error);
    }
    return { ok: true, data: null };
  } catch {
    return failure(undefined);
  }
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput,
): Promise<Result<AccountDto | null>> {
  try {
    const { data, error } = await apiClient.PUT('/api/v1/accounts/me/notification-preferences', {
      body: input,
    });
    if (error) {
      return failure(error);
    }
    return { ok: true, data: data ?? null };
  } catch {
    return failure(undefined);
  }
}

export async function logout(): Promise<Result<null>> {
  try {
    const { error } = await apiClient.POST('/api/v1/accounts/logout', {});
    if (error) {
      return failure(error);
    }
    return { ok: true, data: null };
  } catch {
    return failure(undefined);
  }
}
