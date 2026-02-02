export function requireRole(
  user: { role: string } | undefined,
  allowed: string[],
) {
  return user && allowed.includes(user.role);
}
