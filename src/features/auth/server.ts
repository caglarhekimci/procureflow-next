import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { container } from '@/infrastructure/container';
export const SESSION_COOKIE = 'procureflow_session';
export async function currentActor() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return container().identity.actor(token);
}
export async function requireActor() {
  const actor = await currentActor();
  if (!actor) redirect('/login');
  return actor;
}
