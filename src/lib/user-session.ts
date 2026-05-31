const USER_ID_STORAGE_KEY = "rti-ease-user-id";

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_STORAGE_KEY);
}

export function setStoredUserId(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_ID_STORAGE_KEY, userId);
}

export function clearStoredUserId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_ID_STORAGE_KEY);
}
