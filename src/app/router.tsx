import { Navigate, createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppShell, RoleGuard } from '@/components';
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
import { PlaceholderScreen } from '@/features/PlaceholderScreen';
import { RootRedirect } from './RootRedirect';

// Route table. The account screens (registration, and the non-functional onboarding steps) sit
// outside the app shell, shown before the user is in the authenticated app. Buyer and farmer
// sections are role gated. Exported so tests can mount it in a memory router.
export const routes: RouteObject[] = [
  { path: '/register', element: <Navigate to="/register/buyer" replace /> },
  { path: '/register/buyer', element: <RegisterScreen role="buyer" /> },
  { path: '/register/farmer', element: <RegisterScreen role="farmer" /> },
  { path: '/register/verify-phone', element: <VerifyPhoneScreen /> },
  { path: '/register/verify-identity', element: <VerifyIdentityScreen /> },
  { path: '/register/upload-id', element: <UploadIdScreen /> },
  { path: '/sign-in', element: <SignInScreen /> },
  { path: '/forgot-password', element: <ForgotPasswordScreen /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <RootRedirect /> },

      // Buyer section.
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

      // Farmer section.
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

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
