import { getJson } from './apiClient.ts';
import { createAuthClient } from 'better-auth/client';
import { clearStoredStudentSession } from './studentSessionStore.ts';

export type AuthResult = Awaited<ReturnType<typeof authClient.signIn.email>>;

/**
 * BetterAuth client configured to communicate with the backend auth service.
 * The baseURL is constructed from VITE_API_BASE_URL (from root workspace .env) + /auth.
 * Example: http://localhost:3000/api/v1/auth
 */
export const authClient = createAuthClient({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/auth`,
});

export const signInWithEmail = (
  email: string,
  password: string,
  remember: boolean,
) => {
  return authClient.signIn.email({
    email,
    password,
    rememberMe: remember,
  });
};

export const signUpWithEmail = (email: string, password: string) => {
  const displayName = email.split('@')[0] || email;

  return authClient.signUp.email({
    email,
    password,
    name: displayName,
  });
};

export const signOut = async () => {
  const result = await authClient.signOut();
  if (!result.error) {
    clearStoredStudentSession();
  }

  return result;
};

export const fetchAuthSession = () => {
  return getJson('/auth/get-session');
};
