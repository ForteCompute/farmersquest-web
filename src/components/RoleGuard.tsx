import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSession } from '@/app/session';
import { homePathForRole } from '@/app/navigation';
import type { Role } from '@/app/roles';

// Route-level role gate. If the active role does not match the section, send the user to their own
// home rather than showing a section that is not theirs. This is a presentation gate only: the API
// is the real authority and re-checks role and ownership on every protected action.
export function RoleGuard({ allow, children }: { allow: Role; children: ReactNode }) {
  const { role } = useSession();
  if (role !== allow) {
    return <Navigate to={homePathForRole(role)} replace />;
  }
  return <>{children}</>;
}
