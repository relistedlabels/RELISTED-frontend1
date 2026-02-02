import { useUserStore } from "@/store/useUserStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const USER_STORE_KEY = "user-store";

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

/** Token from store, or from localStorage if store not yet rehydrated */
export function getAuthToken(): string | null {
  const fromStore = useUserStore.getState().token;
  if (fromStore) return fromStore;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as
      | { state?: { token?: string | null }; token?: string | null }
      | null;
    if (!parsed) return null;
    return parsed?.state?.token ?? parsed?.token ?? null;
  } catch {
    return null;
  }
}

async function doFetch<T>(
  path: string,
  options: RequestInit,
  token: string | null,
  isFormData: boolean,
): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  let res = await doFetch(path, options, token, isFormData);

  // Retry once with token from localStorage if 401 (to handle rehydration race)
  if (res.status === 401 && token === null && typeof window !== "undefined") {
    const retryToken = getAuthToken();
    if (retryToken) {
      res = await doFetch(path, options, retryToken, isFormData);
    }
  }

  if (!res.ok) {
    let errorMessage = "Request failed";
    try {
      const error = await res.json();
      errorMessage = error?.message ?? errorMessage;
    } catch {}

    if (res.status === 401) {
      useUserStore.getState().clearUser();
    }

    throw new Error(errorMessage);
  }

  return res.json();
}
