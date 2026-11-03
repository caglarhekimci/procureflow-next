import type Database from 'better-sqlite3';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { AppError } from '@/shared/errors';
import type { Actor } from '@/features/requests/domain/model';
export interface IdentityConfig {
  demoMode: boolean;
  password: string;
  sessionSeconds: number;
}
const digest = (s: string) => createHash('sha256').update(s).digest('hex');
export class IdentityService {
  constructor(
    private readonly db: Database.Database,
    private readonly config: IdentityConfig,
    private readonly now: () => number = Date.now,
  ) {}
  login(email: string, password: string) {
    if (!this.config.demoMode || this.config.password.length < 12)
      throw new AppError('DEMO_DISABLED', 'Demo login is disabled', 503);
    const normalized = email.trim().toLowerCase(),
      subject = digest(normalized),
      now = this.now();
    const attempt = this.db
      .prepare('SELECT attempts,window_start AS started FROM login_attempts WHERE subject=?')
      .get(subject) as { attempts: number; started: number } | undefined;
    if (attempt && now - attempt.started < 900000 && attempt.attempts >= 5)
      throw new AppError('RATE_LIMIT', 'Too many attempts. Try again in 15 minutes.', 429);
    const actor = this.db.prepare('SELECT id FROM users WHERE email=?').get(normalized) as
      { id: string } | undefined;
    const matches = timingSafeEqual(
      Buffer.from(digest(password), 'hex'),
      Buffer.from(digest(this.config.password), 'hex'),
    );
    if (!actor || !matches) {
      this.db
        .prepare(
          'INSERT INTO login_attempts(subject,attempts,window_start) VALUES(?,1,?) ON CONFLICT(subject) DO UPDATE SET attempts=CASE WHEN ?>=window_start+900000 THEN 1 ELSE attempts+1 END,window_start=CASE WHEN ?>=window_start+900000 THEN ? ELSE window_start END',
        )
        .run(subject, now, now, now, now);
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }
    return this.db.transaction(() => {
      this.db
        .prepare('DELETE FROM login_attempts WHERE subject=? OR window_start<?')
        .run(subject, now - 900000);
      this.db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now);
      const token = randomBytes(32).toString('base64url');
      this.db
        .prepare('INSERT INTO sessions(digest,user_id,expires_at) VALUES(?,?,?)')
        .run(digest(token), actor.id, now + this.config.sessionSeconds * 1000);
      return token;
    })();
  }
  actor(token: string | undefined): Actor | null {
    if (!token) return null;
    return (
      (this.db
        .prepare(
          'SELECT u.id,u.tenant_id AS tenantId,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.digest=? AND s.expires_at>?',
        )
        .get(digest(token), this.now()) as Actor | undefined) ?? null
    );
  }
  logout(token: string | undefined) {
    if (token) this.db.prepare('DELETE FROM sessions WHERE digest=?').run(digest(token));
  }
}
