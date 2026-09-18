export type GuestContactInfo = {
  firstName: string;
  email: string;
};

const STORAGE_KEY = "relisted:guest-ar-contact";

export function readGuestContact(): GuestContactInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GuestContactInfo>;
    const firstName = parsed.firstName?.trim();
    const email = parsed.email?.trim();
    if (!firstName || !email) return null;
    return { firstName, email };
  } catch {
    return null;
  }
}

export function saveGuestContact(contact: GuestContactInfo): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        firstName: contact.firstName.trim(),
        email: contact.email.trim(),
      }),
    );
  } catch {
    // Ignore quota or private-mode errors.
  }
}
