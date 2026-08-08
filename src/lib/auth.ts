/**
 * Client-side auth helpers.
 * The actual authentication is handled by the FastAPI backend.
 * This module provides helper functions for cookie-based session management
 * and login/logout state tracking in the browser.
 */

const SESSION_COOKIE_NAME = "session_id";

/**
 * Get the session ID from browser cookies (client-side).
 * NOTE: httpOnly cookies are not accessible from JS - this only works
 * for non-httpOnly cookies. For httpOnly, use /api/auth/me to check auth.
 */
export function getSessionId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Check if user appears to be logged in (has session cookie).
 * This is a fast client-side check; always verify with /api/auth/me for real auth.
 */
export function isLoggedIn(): boolean {
  return getSessionId() !== null;
}

/**
 * Clear the session cookie on the client side.
 * Also calls /api/auth/logout to invalidate the server session.
 */
export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    // Ignore errors - clear cookie anyway
  }
  // Clear cookie from client side
  if (typeof document !== "undefined") {
    document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

export interface User {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

/**
 * Get current user from the backend session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || data;
  } catch {
    return null;
  }
}
