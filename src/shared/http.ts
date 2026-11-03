import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';
import { currentActor } from '@/features/auth/server';
export async function authenticated() {
  const actor = await currentActor();
  if (!actor) throw new AppError('UNAUTHORIZED', 'Please sign in', 401);
  return actor;
}
export function assertOrigin(request: Request) {
  const expected = process.env.APP_ORIGIN;
  if (!expected) throw new AppError('CONFIGURATION', 'Application origin is not configured', 503);
  if (request.headers.get('origin') !== new URL(expected).origin)
    throw new AppError('INVALID_ORIGIN', 'Request origin is not allowed', 403);
}
export async function jsonBody(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new AppError('CONTENT_TYPE', 'Use application/json', 415);
  const reader = request.body?.getReader();
  if (!reader) throw new AppError('INVALID_JSON', 'A JSON body is required');
  let total = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > 16384) {
        await reader.cancel();
        throw new AppError('PAYLOAD_TOO_LARGE', 'Request is too large', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new AppError('INVALID_JSON', 'Invalid JSON body');
  }
}
export function failure(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION',
          message: error.issues.map((i) => i.path.join('.') + ': ' + i.message).join('; '),
        },
      },
      { status: 400 },
    );
  if (error instanceof AppError)
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  console.error('Request failed', { name: error instanceof Error ? error.name : 'UnknownError' });
  return NextResponse.json(
    { error: { code: 'INTERNAL', message: 'Something went wrong. Please try again.' } },
    { status: 500 },
  );
}
