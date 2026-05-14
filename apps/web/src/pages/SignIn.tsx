import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.tsx';
import { signInWithEmail, signOut } from '../lib/authClient.ts';
import { fetchCurrentStudent } from '../lib/unihubApi.ts';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithEmail(email.trim(), password, remember);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message || 'An error occurred while signing in.');
      return;
    }

    const studentResult = await fetchCurrentStudent();

    if (!studentResult.ok) {
      if (studentResult.statusCode === 403) {
        await signOut();
        setError(
          'This account is not linked to a student profile. Please use the email already synced from the student list or ask an organizer to sync your account.',
        );
        return;
      }

      if (studentResult.statusCode === 401) {
        await signOut();
        setError('Unable to verify your session. Please try signing in again.');
        return;
      }
    }

    setSuccess(true);
    void navigate('/workshops');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Please log in to access your dashboard."
      footer={
        <span>
          Do not have an account? <a href="/sign-up">Create account</a>
        </span>
      }
    >
      {error ? (
        <div className="alert" role="alert">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="alert" role="status">
          <span aria-hidden="true">!</span>
          Signed in successfully.
        </div>
      ) : null}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="signin-email">Email Address</label>
          <div className="input-wrap">
            <span className="input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
                  strokeWidth="1.6"
                />
                <path
                  d="m22 8-10 6L2 8"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              id="signin-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="form-row" style={{ marginBottom: 8 }}>
            <label htmlFor="signin-password">Password</label>
            <a href="#">Forgot password?</a>
          </div>
          <div className="input-wrap">
            <span className="input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 11V7a5 5 0 0 0-10 0v4" strokeWidth="1.6" />
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="9"
                  rx="2"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="form-row">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Keep me logged in
          </label>
          <span style={{ color: 'transparent' }}>.</span>
        </div>
        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Log In'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
