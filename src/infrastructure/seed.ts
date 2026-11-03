import type Database from 'better-sqlite3';
import { RequestService } from '@/features/requests/application/service';
import { SqliteRequestRepository } from '@/features/requests/infrastructure/sqlite-repository';
import type { Actor } from '@/features/requests/domain/model';
export const demoUsers: Actor[] = [
  {
    id: 'ayse',
    tenantId: 'atlas',
    name: 'Ayşe Yılmaz',
    email: 'ayse@atlas.demo',
    role: 'requester',
  },
  { id: 'mert', tenantId: 'atlas', name: 'Mert Kaya', email: 'mert@atlas.demo', role: 'approver' },
  { id: 'deniz', tenantId: 'atlas', name: 'Deniz Akın', email: 'deniz@atlas.demo', role: 'viewer' },
  { id: 'elif', tenantId: 'nova', name: 'Elif Demir', email: 'elif@nova.demo', role: 'approver' },
];
export function seed(db: Database.Database) {
  if (db.prepare('SELECT 1 FROM tenants LIMIT 1').get()) return;
  db.transaction(() => {
    db.prepare('INSERT INTO tenants VALUES (?,?)').run('atlas', 'Atlas Studio');
    db.prepare('INSERT INTO tenants VALUES (?,?)').run('nova', 'Nova Labs');
    for (const a of demoUsers)
      db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(
        a.id,
        a.tenantId,
        a.name,
        a.email,
        a.role,
      );
    const repo = new SqliteRequestRepository(db);
    const titles = [
      ['Figma organization seats', 'Figma', 'Software', 4680000],
      ['Studio display upgrade', 'Apple', 'Equipment', 12490000],
      ['Research participant pool', 'Respondent', 'Services', 2850000],
      ['Design systems workshop', 'DesignOps', 'Services', 3200000],
      ['Team planning offsite', 'Setur', 'Travel', 5600000],
      ['Linear business plan', 'Linear', 'Software', 1920000],
      ['Ergonomic workspace', 'Koleksiyon', 'Equipment', 8750000],
    ] as const;
    for (let i = 0; i < titles.length; i++) {
      const [title, supplier, category, amountMinor] = titles[i];
      const date = new Date(Date.UTC(2026, 10, 1, 9 + i)).toISOString();
      const s = new RequestService(repo, () => date);
      const r = s.create(demoUsers[0], {
        title,
        supplier,
        category,
        amountMinor,
        description:
          'Planned investment for the product and design team. Procurement review requested.',
      });
      if (i < 5) s.transition(demoUsers[0], r.id, { action: 'submit', version: 1 });
      if (i === 0 || i === 2) s.transition(demoUsers[1], r.id, { action: 'approve', version: 2 });
      if (i === 4)
        s.transition(demoUsers[1], r.id, {
          action: 'reject',
          version: 2,
          reason: 'Please revise the travel scope and budget.',
        });
    }
    new RequestService(repo).create(demoUsers[3], {
      title: 'Nova private equipment',
      supplier: 'Nova vendor',
      category: 'Equipment',
      amountMinor: 100000,
      description: 'Private request for the second tenant.',
    });
  })();
}
