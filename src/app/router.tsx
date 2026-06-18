import { Navigate, createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppShell, RoleGuard } from '@/components';
import { StorefrontLayout } from '@/components/storefront';
import { LandingPage } from '@/features/landing';
import { BrowsePage } from '@/features/browse';
import { CategoryPage } from '@/features/category';
import { BuyerHome } from '@/features/buyer';
import { FarmerHome } from '@/features/farmer';
import {
  ForgotPasswordScreen,
  RegisterScreen,
  SignInScreen,
  UploadIdScreen,
  VerifyIdentityScreen,
  VerifyPhoneScreen,
} from '@/features/accounts';
import {
  EditProfileScreen,
  NotificationsScreen,
  ProfileScreen,
  SecurityScreen,
} from '@/features/profile';
import { PlaceholderScreen } from '@/features/PlaceholderScreen';

// Route table.
// - The root is the public storefront landing, no login needed.
// - Account screens (sign up, sign in, password) sit outside the app shell.
// - The signed-in app (role homes and account settings) is wrapped by the role-gated AppShell.
// Exported so tests can mount it in a memory router.
//
// The storefront product page and the final /join and /account routes arrive in their own pull
// requests per the build order; until then /product falls through to the catch-all, and /join and
// /account alias the existing account screens.
export const routes: RouteObject[] = [
  // Public storefront landing.
  {
    path: '/',
    element: (
      <StorefrontLayout showHeaderSearch={false}>
        <LandingPage />
      </StorefrontLayout>
    ),
  },

  // Public storefront browse with filters.
  {
    path: '/browse',
    element: (
      <StorefrontLayout>
        <BrowsePage />
      </StorefrontLayout>
    ),
  },

  // Public storefront category listing.
  {
    path: '/category/:slug',
    element: (
      <StorefrontLayout>
        <CategoryPage />
      </StorefrontLayout>
    ),
  },

  // Account screens (onboarding, auth).
  { path: '/register', element: <Navigate to="/register/buyer" replace /> },
  { path: '/register/buyer', element: <RegisterScreen role="buyer" /> },
  { path: '/register/farmer', element: <RegisterScreen role="farmer" /> },
  { path: '/register/verify-phone', element: <VerifyPhoneScreen /> },
  { path: '/register/verify-identity', element: <VerifyIdentityScreen /> },
  { path: '/register/upload-id', element: <UploadIdScreen /> },
  { path: '/sign-in', element: <SignInScreen /> },
  { path: '/forgot-password', element: <ForgotPasswordScreen /> },

  // Aliases for the confirmed route names, pointing at the current screens until the auth rename.
  { path: '/join', element: <Navigate to="/register" replace /> },
  { path: '/join/buyer', element: <Navigate to="/register/buyer" replace /> },
  { path: '/join/farmer', element: <Navigate to="/register/farmer" replace /> },
  { path: '/account', element: <Navigate to="/profile" replace /> },

  // Signed-in app, role gated, inside the app shell.
  {
    element: <AppShell />,
    children: [
      {
        path: 'buyer',
        element: (
          <RoleGuard allow="buyer">
            <BuyerHome />
          </RoleGuard>
        ),
      },
      {
        path: 'buyer/browse',
        element: (
          <RoleGuard allow="buyer">
            <PlaceholderScreen title="Browse" area="The market" />
          </RoleGuard>
        ),
      },
      {
        path: 'buyer/orders',
        element: (
          <RoleGuard allow="buyer">
            <PlaceholderScreen title="Orders" area="Buyer orders" />
          </RoleGuard>
        ),
      },
      {
        path: 'farmer',
        element: (
          <RoleGuard allow="farmer">
            <FarmerHome />
          </RoleGuard>
        ),
      },
      {
        path: 'farmer/listings',
        element: (
          <RoleGuard allow="farmer">
            <PlaceholderScreen title="Listings" area="Your listings" />
          </RoleGuard>
        ),
      },
      {
        path: 'farmer/orders',
        element: (
          <RoleGuard allow="farmer">
            <PlaceholderScreen title="Orders" area="Farmer orders" />
          </RoleGuard>
        ),
      },
      { path: 'profile', element: <ProfileScreen /> },
      { path: 'profile/edit', element: <EditProfileScreen /> },
      { path: 'profile/security', element: <SecurityScreen /> },
      { path: 'profile/notifications', element: <NotificationsScreen /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
];

export const router = createBrowserRouter(routes);
