import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { isRole, type Role } from './roles';

// A minimal session context holding the active role. This is a placeholder for real authentication:
// it lets the shell gate navigation by role today, and gives feature code a stable `useSession`
// hook to build against. When sign in arrives, only this provider changes; consumers do not.

interface SessionValue {
  role: Role;
  setRole: (role: Role) => void;
}

const STORAGE_KEY = 'fq.web.role';

const SessionContext = createContext<SessionValue | null>(null);

function readStoredRole(): Role {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isRole(stored)) {
      return stored;
    }
  } catch {
    // Storage may be unavailable (private mode). Fall back to the default.
  }
  return 'buyer';
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(readStoredRole);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Best effort only; the in-memory role still updates.
    }
  }, []);

  const value = useMemo<SessionValue>(() => ({ role, setRole }), [role, setRole]);

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
