import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { assertOrigin, failure } from '@/shared/http';
import { container } from '@/infrastructure/container';
import { SESSION_COOKIE } from '@/features/auth/server';
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    container().identity.logout((await cookies()).get(SESSION_COOKIE)?.value);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (e) {
    return failure(e);
  }
}
