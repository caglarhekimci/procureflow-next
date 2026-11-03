export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message ?? 'Unable to complete your request');
  return payload as T;
}
