import type { UserProfileViewModel } from './unihubAdapters.ts';

const STUDENT_SESSION_KEY = 'unihub:student-session';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isValidStudentProfile = (
  value: unknown,
): value is UserProfileViewModel => {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.mssv === 'string' &&
    typeof value.fullName === 'string' &&
    typeof value.email === 'string' &&
    typeof value.phone === 'string' &&
    typeof value.bio === 'string' &&
    typeof value.major === 'string' &&
    typeof value.year === 'string' &&
    typeof value.avatar === 'string' &&
    typeof value.verified === 'boolean'
  );
};

export const loadStoredStudentSession = (): UserProfileViewModel | null => {
  try {
    const raw = window.localStorage.getItem(STUDENT_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isValidStudentProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveStoredStudentSession = (student: UserProfileViewModel) => {
  window.localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(student));
};

export const clearStoredStudentSession = () => {
  window.localStorage.removeItem(STUDENT_SESSION_KEY);
};
