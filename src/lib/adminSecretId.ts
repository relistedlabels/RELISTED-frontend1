/**
 * Server-side validation for admin secret ID
 * Only k340eol21 is the valid admin access ID
 */

const VALID_ADMIN_ID = "k340eol21";

export function validateAdminId(id: string | undefined): boolean {
  return id === VALID_ADMIN_ID;
}

export function getAdminIdFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url, "http://localhost").pathname;
    const match = pathname.match(/\/admin\/([^/]+)\//);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
