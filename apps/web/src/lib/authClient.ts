const DEFAULT_BASE_URL = "http://localhost:3000/api/v1";

export type AuthResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

const baseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_BASE_URL;

const requestAuth = async (
  path: string,
  payload: Record<string, string>,
): Promise<AuthResult> => {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (data && typeof data === "object" && "message" in data
          ? String((data as { message?: string }).message)
          : null) || "Unable to authenticate. Please try again.";
      return { ok: false, error: message };
    }

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to connect. Please try again.",
    };
  }
};

export const signInWithEmail = (email: string, password: string) => {
  return requestAuth("/auth/sign-in/email", { email, password });
};

export const signUpWithEmail = (email: string, password: string) => {
  return requestAuth("/auth/sign-up/email", { email, password });
};
