import { postMockAuth } from "./mockApi.ts";

export type AuthResult = Awaited<ReturnType<typeof signInWithEmail>>;

export const signInWithEmail = (
  email: string,
  password: string,
  remember: boolean,
) => {
  return postMockAuth("/auth/sign-in/email", {
    email,
    password,
    remember,
  });
};

export const signUpWithEmail = (email: string, password: string) => {
  return postMockAuth("/auth/sign-up/email", {
    email,
    password,
  });
};
