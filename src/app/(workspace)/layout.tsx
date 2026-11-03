import { requireActor } from '@/features/auth/server';
import { Navigation } from '@/components/navigation';
import { ShieldCheck } from 'lucide-react';
export const dynamic = 'force-dynamic';
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireActor();
  return (
    <div className="app-shell">
      <Navigation actor={actor} />
      <div className="workspace-main">
        <header className="topbar">
          <span>
            Workspace <span className="crumb-divider">/</span> <strong>Procurement</strong>
          </span>
          <span className="demo-indicator">
            <ShieldCheck size={15} />
            Local demo workspace
          </span>
        </header>
        <main id="main" className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>Thoughtful purchasing. Clear accountability.</span>
          <span>ProcureFlow · Portfolio edition</span>
        </footer>
      </div>
    </div>
  );
}
