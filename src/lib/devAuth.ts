const DEV_KEY = "dev_access";
const DEV_PIN = "2026Sales";

export const devAuth = {
  hasAccess(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DEV_KEY) === "true";
  },

  login(pin: string): boolean {
    if (pin === DEV_PIN) {
      localStorage.setItem(DEV_KEY, "true");
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem(DEV_KEY);
  },
};
