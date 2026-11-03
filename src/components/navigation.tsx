'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Files, Plus, LogOut, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { Actor } from '@/features/requests/domain/model';
import { api } from '@/shared/client-api';
export function Navigation({ actor }: { actor: Actor }) {
  const path = usePathname(),
    router = useRouter();
  const [error, setError] = useState('');
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark">
          p<span>f</span>
        </span>
        procureflow<span className="brand-dot">.</span>
      </Link>
      <div className="workspace-chip">
        <span className="workspace-avatar">{actor.tenantId === 'atlas' ? 'A' : 'N'}</span>
        <span>
          {actor.tenantId === 'atlas' ? 'Atlas Studio' : 'Nova Labs'}
          <small>Team workspace</small>
        </span>
      </div>
      <p className="nav-heading">WORKSPACE</p>
      <nav aria-label="Main navigation">
        <Link
          className={path === '/' ? 'nav-link active' : 'nav-link'}
          href="/"
          aria-current={path === '/' ? 'page' : undefined}
        >
          <LayoutDashboard size={18} />
          Overview
        </Link>
        <Link
          className={
            path.startsWith('/requests') && !path.endsWith('/new') ? 'nav-link active' : 'nav-link'
          }
          href="/requests"
          aria-current={path === '/requests' ? 'page' : undefined}
        >
          <Files size={18} />
          Requests
        </Link>
        {actor.role !== 'viewer' ? (
          <Link
            className={path.endsWith('/new') ? 'nav-link active' : 'nav-link'}
            href="/requests/new"
          >
            <Plus size={18} />
            New request
          </Link>
        ) : null}
      </nav>
      <div className="sidebar-bottom">
        <div className="guide-card">
          <ArrowUpRight size={21} />
          <strong>
            Good decisions,
            <br />
            clear records.
          </strong>
          <p>Every request has an owner. Every decision has a trail.</p>
        </div>
        <div className="profile">
          <span className="avatar">
            {actor.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </span>
          <span>
            <strong>{actor.name}</strong>
            <small>{actor.role}</small>
          </span>
          <button
            className="icon-button"
            aria-label="Sign out"
            onClick={async () => {
              try {
                await api('/api/auth/logout', { method: 'POST' });
                router.replace('/login');
                router.refresh();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
        {error ? (
          <p role="alert" className="error-text">
            {error}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
