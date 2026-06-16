// Application configuration, read once from the environment. Nothing environment specific is
// hardcoded anywhere else in the app; everything funnels through here. Only VITE_ prefixed
// variables exist in the browser bundle, and none of them are secrets (secrets live in the API).
//
// Vite exposes these on import.meta.env at build time. We validate the required ones up front so a
// misconfigured deployment fails loudly and early rather than midway through a request.

export interface AppConfig {
  /** Base URL of the FarmersQuest API. No trailing slash. */
  apiBaseUrl: string;
  /** Display name for the app. */
  appName: string;
  /** Environment label (Development, Staging, Production). */
  environment: string;
}

function required(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env.local and set it.`,
    );
  }
  return value.trim();
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export const config: AppConfig = {
  apiBaseUrl: stripTrailingSlash(required('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL)),
  appName: import.meta.env.VITE_APP_NAME?.trim() || 'FarmersQuest',
  environment: import.meta.env.VITE_APP_ENVIRONMENT?.trim() || 'Development',
};
