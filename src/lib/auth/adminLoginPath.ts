export function adminIdFromPathname(pathname: string): string | null {
  return pathname.match(/^\/admin\/([^/]+)/)?.[1] ?? null;
}

export function getAdminLoginPath(adminId: string | null | undefined): string {
  return adminId ? `/admin/${adminId}/auth/login` : "/auth/sign-in";
}
