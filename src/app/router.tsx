import { Navigate, createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppShell, RoleGuard } from '@/components';
import { BuyerHome } from '@/features/buyer';
import { FarmerHome } from '@/features/farmer';
import { PlaceholderScreen } from '@/features/PlaceholderScreen';
import { RootRedirect } from './RootRedirect';

// Route table. Buyer and farmer sections are role gated. Real screens are placeholders for now; the
// shape is here so feature tickets slot their screens straight in. Exported so tests can mount it
// in a memory router.
export const routes: RouteObject[] = [
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
