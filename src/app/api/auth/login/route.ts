import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertOrigin, jsonBody, failure } from '@/shared/http';
import { container } from '@/infrastructure/container';
import { SESSION_COOKIE } from '@/features/auth/server';
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const input = z
      .object({ email: z.email().max(200), password: z.string().max(200) })
      .parse(await jsonBody(request));
    const token = container().identity.login(input.email, input.password);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.APP_ORIGIN?.startsWith('https://'),
      path: '/',
      maxAge: 8 * 60 * 60,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (e) {
    return failure(e);
  }
}
