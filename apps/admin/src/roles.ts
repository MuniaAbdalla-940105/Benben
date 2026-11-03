/** Roles allowed into the staff dashboard. B6 builds the screens; B1 ships the login and the gate only. */
export const ADMIN_ROLES = ['kyc_admin', 'admin', 'super_admin'] as const;

export function hasAdminRole(roles: readonly string[]): boolean {
  return roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r));
}
