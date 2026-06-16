import { Navigate } from 'react-router-dom';
import { useSession } from './session';
import { homePathForRole } from './navigation';

// The index route sends the user to the home of their active role.
export function RootRedirect() {
  const { role } = useSession();
  return <Navigate to={homePathForRole(role)} replace />;
}
