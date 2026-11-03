'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { api } from '@/shared/client-api';
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('ayse@atlas.demo'),
    [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="login-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
          await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          router.replace('/');
          router.refresh();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="field">
        <label htmlFor="email">Demo account</label>
        <select id="email" value={email} onChange={(e) => setEmail(e.target.value)}>
          <option value="ayse@atlas.demo">Ayşe · Atlas · Requester</option>
          <option value="mert@atlas.demo">Mert · Atlas · Approver</option>
          <option value="deniz@atlas.demo">Deniz · Atlas · Viewer</option>
          <option value="elif@nova.demo">Elif · Nova · Approver</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="password">Local demo password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          maxLength={200}
        />
      </div>
      {error ? (
        <p role="alert" className="error-box">
          {error}
        </p>
      ) : null}
      <button className="button primary full-width" disabled={busy}>
        {busy ? 'Signing in…' : 'Open workspace'}
        <ArrowRight size={17} />
      </button>
    </form>
  );
}
