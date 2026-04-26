// Inhouse Manager Configuration
// This file manages inhouse-specific configurations and state

export const INHOUSE_MANAGER_CONFIG = {
  userId: "7d172d18-daad-46cd-ab6d-8d8af28c0b16",
} as const;

// Export the userId for easy access in components
export const INHOUSE_USER_ID = INHOUSE_MANAGER_CONFIG.userId;

// Type for inhouse manager data
export interface InhouseManagerData {
  userId: string;
}

// Utility to check if user is inhouse manager
export const isInhouseManager = (userId: string | undefined): boolean => {
  return userId === INHOUSE_USER_ID;
};
