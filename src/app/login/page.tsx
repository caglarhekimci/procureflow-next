import { redirect } from 'next/navigation';
import { currentActor } from '@/features/auth/server';
import { LoginForm } from './login-form';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };
export default async function Login() {
  if (await currentActor()) redirect('/');
  return (
    <main id="main" className="login-layout">
      <section className="login-story">
        <div className="brand">
          <span className="brand-mark">
            p<span>f</span>
          </span>
          procureflow.
        </div>
        <div>
          <p className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</p>
          <h1>
            Better purchases.
            <br />
            Clearer decisions.
            <br />
            <em>Stronger teams.</em>
          </h1>
          <p>
            A thoughtful workspace for the things your team needs — and the decisions behind them.
          </p>
        </div>
        <span className="login-caption">Ownership. Context. Accountability.</span>
      </section>
      <section className="login-form-wrap">
        <div className="login-form-inner">
          <span className="pill">PORTFOLIO DEMO</span>
          <h2>Welcome to your workspace.</h2>
          <p className="muted">
            Choose a demo account and enter the password you configured locally.
          </p>
          <LoginForm />
          <div className="login-info">
            <strong>Two companies. Three roles.</strong>
            <p>
              Atlas has a requester, approver and viewer. Nova is a separate workspace. No real
              purchases or messages are sent.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
