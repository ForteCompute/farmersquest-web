import type { Role } from './roles';

// The navigation map per role. These are placeholders for the real screens, which feature tickets
// will fill in. Paths are namespaced by role so routing stays clear as features land. Keep this the
// single place that declares what each role can navigate to.
export interface NavEntry {
  key: string;
  label: string;
  path: string;
  icon: string;
}

const buyerNav: NavEntry[] = [
  { key: 'buyer-home', label: 'Home', path: '/buyer', icon: '🏠' },
  { key: 'buyer-browse', label: 'Browse', path: '/buyer/browse', icon: '🛒' },
  { key: 'buyer-orders', label: 'Orders', path: '/buyer/orders', icon: '📦' },
];

const farmerNav: NavEntry[] = [
  { key: 'farmer-home', label: 'Home', path: '/farmer', icon: '🏠' },
  { key: 'farmer-listings', label: 'Listings', path: '/farmer/listings', icon: '🌾' },
  { key: 'farmer-orders', label: 'Orders', path: '/farmer/orders', icon: '📦' },
];

export function navForRole(role: Role): NavEntry[] {
  return role === 'farmer' ? farmerNav : buyerNav;
}

export function homePathForRole(role: Role): string {
  return role === 'farmer' ? '/farmer' : '/buyer';
}
