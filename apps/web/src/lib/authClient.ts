import { postMockAuth } from "./mockApi.ts";

export type AuthResult = Awaited<ReturnType<typeof signInWithEmail>>;

export const signInWithEmail = (
  email: string,
  password: string,
  remember: boolean,
) => {
  // Replace this mock auth call with the real sign-in endpoint integration later.
  return postMockAuth("/auth/sign-in/email", {
    email,
    password,
    remember,
  });
};

export const signUpWithEmail = (email: string, password: string) => {
  // Replace this mock auth call with the real sign-up endpoint integration later.
  return postMockAuth("/auth/sign-up/email", {
    email,
    password,
  });
};
