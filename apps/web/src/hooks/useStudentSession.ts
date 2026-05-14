import { useEffect, useState } from 'react';
import { mapStudentToProfileViewModel } from '../lib/unihubAdapters.ts';
import { fetchCurrentStudent } from '../lib/unihubApi.ts';
import {
  clearStoredStudentSession,
  loadStoredStudentSession,
  saveStoredStudentSession,
} from '../lib/studentSessionStore.ts';
import type { UserProfileViewModel } from '../lib/unihubAdapters.ts';

type StudentSessionStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

const useStudentSession = () => {
  const cachedStudent = loadStoredStudentSession();
  const [status, setStatus] = useState<StudentSessionStatus>(
    cachedStudent ? 'authenticated' : 'loading',
  );
  const [student, setStudent] = useState<UserProfileViewModel | null>(
    cachedStudent,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadSession = async () => {
      const result = await fetchCurrentStudent();

      if (!isActive) {
        return;
      }

      if (result.ok) {
        const nextStudent = mapStudentToProfileViewModel(result.data);
        saveStoredStudentSession(nextStudent);
        setStudent(nextStudent);
        setError(null);
        setStatus('authenticated');
        return;
      }

      if (result.statusCode === 401 || result.statusCode === 403) {
        clearStoredStudentSession();
        setStudent(null);
        setError(null);
        setStatus('unauthenticated');
        return;
      }

      if (cachedStudent) {
        setStudent(cachedStudent);
        setError(null);
        setStatus('authenticated');
        return;
      }

      setStudent(null);
      setError(result.error);
      setStatus('error');
    };

    void loadSession();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    status,
    student,
    error,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
  };
};

export default useStudentSession;
