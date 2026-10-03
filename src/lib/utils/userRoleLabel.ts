export function userRoleLabel(role: string | null | undefined): string {
  if (!role) return "";
  return role.toLowerCase() === "renter" ? "Shopper" : role;
}
