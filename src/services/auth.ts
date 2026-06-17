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
