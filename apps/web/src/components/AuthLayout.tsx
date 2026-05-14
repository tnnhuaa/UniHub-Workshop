import type { ReactNode } from 'react';

const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-hero-content">
          <h1>School UniHub Workshop</h1>
          <p>
            Empowering academic excellence through seamless workshop management
            and collaborative scheduling.
          </p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <header className="auth-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </header>
          {children}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
