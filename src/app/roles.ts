// The two roles this web client serves. Buyers shop; farmers sell. (The API also knows middleman
// and admin roles, but those belong to other clients: middleman flows and the back office.)
//
// Authentication is not built yet. For this foundation the active role is chosen in the shell and
// kept in the browser, purely to demonstrate role-gated navigation. When sign in lands, the role
// will come from the authenticated session and the server will remain the real authority on what
// each role may do. The web client only gates what it shows.
export const ROLES = ['buyer', 'farmer'] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  buyer: 'Buyer',
  farmer: 'Farmer',
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
