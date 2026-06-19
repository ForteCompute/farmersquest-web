import { Navigate, Outlet } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront';
import { useSession } from '@/app/session';

// Chrome and access guard for the account area (profile and its settings sub-screens). Renders the
// screens inside the shared storefront layout (header with the logo linking home, footer, and brand
// texture) and requires a signed-in user. A signed-out visitor is sent to sign in; the API stays the
// sole authority and re-checks ownership on every account call.
export function AccountLayout() {
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <StorefrontLayout showHeaderSearch={false}>
      <Outlet />
    </StorefrontLayout>
  );
}
