import { postJson } from './apiClient.ts';

export type AuthResult = Awaited<ReturnType<typeof signInWithEmail>>;

export const signInWithEmail = (
  email: string,
  password: string,
  remember: boolean,
) => {
  return postJson('/auth/sign-in/email', {
    body: {
      email,
      password,
      rememberMe: remember,
    },
  });
};

export const signUpWithEmail = (email: string, password: string) => {
  const displayName = email.split('@')[0] || email;

  return postJson('/auth/sign-up/email', {
    body: {
      email,
      password,
      name: displayName,
    },
  });
};

export const signOut = () => {
  return postJson('/auth/sign-out');
};
