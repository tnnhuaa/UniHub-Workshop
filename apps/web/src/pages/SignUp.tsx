import { useState } from 'react';
import AuthLayout from '../components/AuthLayout.tsx';
import { signUpWithEmail } from '../lib/authClient.ts';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    const result = await signUpWithEmail(email.trim(), password);
    setIsSubmitting(false);

    if (result.error) {
      setError(
        result.error.message || 'An error occurred while creating the account.',
      );
      return;
    }

    setSuccess(true);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Use your email and password to get started."
      footer={
        <span>
          Already have an account? <a href="/sign-in">Log in</a>
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
          Account created successfully. You can now sign in.
        </div>
      ) : null}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="signup-email">Email Address</label>
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
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
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
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
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
        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
