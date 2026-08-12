/**
 * E2E auth fixtures — edit to match accounts seeded in your backend.
 * Registration tests append a unique local-part; sign-in tests use these exact users.
 */
export const authFixtures = {
  signup: {
    /** Domain for generated signup emails (`e2e.renter.*@domain`). Must be accepted by your API. */
    emailDomain: "example.com",
    /** Password for new registrations (min 8 chars per app validation). */
    newAccountPassword: "E2eTestPass1",
  },
  /** Pre-created renter user (verified email, role RENTER). */
  seededRenter: {
    email: "e2e.renter@example.com",
    password: "E2eTestPass1",
  },
  /** Pre-created lister user (verified email, role LISTER). */
  seededLister: {
    email: "e2e.lister@example.com",
    password: "E2eTestPass1",
  },
} as const;
