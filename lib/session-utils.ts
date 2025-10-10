/**
 * Session management utilities for anonymous players
 */

const SESSION_TOKEN_KEY = 'campusguessr_session_token';

/**
 * Generate a unique session token for anonymous players
 * @returns A unique session token string
 */
export function generateSessionToken(): string {
  // Using crypto.randomUUID() for secure random tokens
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `session_${crypto.randomUUID()}`;
  }

  // Fallback for environments without crypto.randomUUID
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get session token from localStorage or create a new one
 * Should only be called on the client side
 * @returns The session token
 */
export function getOrCreateSessionToken(): string {
  if (typeof window === 'undefined') {
    throw new Error('getOrCreateSessionToken can only be called on the client side');
  }

  try {
    let token = localStorage.getItem(SESSION_TOKEN_KEY);

    if (!token) {
      token = generateSessionToken();
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    }

    return token;
  } catch (error) {
    // If localStorage is not available (privacy mode, etc.), generate a new token
    console.warn('localStorage not available, generating temporary session token');
    return generateSessionToken();
  }
}

/**
 * Clear the current session token
 * Useful for starting a fresh session or testing
 */
export function clearSessionToken(): void {
  if (typeof window === 'undefined') {
    throw new Error('clearSessionToken can only be called on the client side');
  }

  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch (error) {
    console.warn('Could not clear session token from localStorage');
  }
}

/**
 * Get the current session token if it exists
 * @returns The session token or null if not set
 */
export function getSessionToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch (error) {
    return null;
  }
}
