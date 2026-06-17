import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { isRole, mapApiRole, type Role } from './roles';
import { setAuthToken } from '@/services/api/authToken';
import type { AccountDto, AuthResultDto } from '@/services/auth';

// The session context. It holds the authenticated account and access token when signed in, and the
// active role. Before sign in, the role is chosen in the shell (the role switcher) and kept in the
// browser, purely to drive role-gated navigation. Once signed in, the role comes from the
// authenticated account and the server remains the sole authority on what each role may do.
//
// Consumers read `role`, `account`, and `isAuthenticated`, and call `signIn` / `signOut`. Sign in
// (registration's follow-on login, and the sign-in screen) hands the auth result here; this is the
// single place the token is stored and handed to the API client.

interface SessionValue {
  role: Role;
  account: AccountDto | null;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  /** Sign in. When persist is false ("remember me" unchecked) the session is kept in memory only
   *  and does not survive a reload. Defaults to persisting. */
  signIn: (auth: AuthResultDto, persist?: boolean) => void;
  signOut: () => void;
}

const ROLE_KEY = 'fq.web.role';
const SESSION_KEY = 'fq.web.session';

interface StoredSession {
  token: string;
  account: AccountDto;
}

const SessionContext = createContext<SessionValue | null>(null);

function readStoredRole(): Role {
  try {
    const stored = window.localStorage.getItem(ROLE_KEY);
    if (isRole(stored)) {
      return stored;
    }
  } catch {
    // Storage may be unavailable (private mode). Fall back to the default.
  }
  return 'buyer';
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as { token?: unknown }).token === 'string' &&
      typeof (parsed as { account?: unknown }).account === 'object' &&
      (parsed as { account?: unknown }).account !== null
    ) {
      return parsed as StoredSession;
    }
  } catch {
    // Corrupt or unavailable storage: treat as signed out.
  }
  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [manualRole, setManualRole] = useState<Role>(readStoredRole);
  const [stored, setStored] = useState<StoredSession | null>(() => {
    const existing = readStoredSession();
    if (existing) {
      // Hand the persisted token to the API client so authenticated calls work after a reload.
      setAuthToken(existing.token);
    }
    return existing;
  });

  const setRole = useCallback((next: Role) => {
    setManualRole(next);
    try {
      window.localStorage.setItem(ROLE_KEY, next);
    } catch {
      // Best effort only; the in-memory role still updates.
    }
  }, []);

  const signIn = useCallback((auth: AuthResultDto, persist = true) => {
    const token = auth.accessToken ?? '';
    const account = auth.account ?? null;
    if (!token || !account) {
      return;
    }
    const next: StoredSession = { token, account };
    setAuthToken(token);
    setStored(next);
    try {
      if (persist) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      } else {
        // "Remember me" off: keep this session in memory only.
        window.localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Best effort; the in-memory session still holds for this tab.
    }
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
    setStored(null);
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore storage failures on sign out.
    }
  }, []);

  const value = useMemo<SessionValue>(() => {
    const account = stored?.account ?? null;
    const role = (account ? mapApiRole(account.role) : null) ?? manualRole;
    return {
      role,
      account,
      isAuthenticated: stored !== null,
      setRole,
      signIn,
      signOut,
    };
  }, [stored, manualRole, setRole, signIn, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- the provider and its hook belong together.
export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within a SessionProvider.');
  }
  return value;
}
