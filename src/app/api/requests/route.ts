import { NextResponse } from 'next/server';
import { authenticated, assertOrigin, jsonBody, failure } from '@/shared/http';
import { container } from '@/infrastructure/container';
import { listSchema } from '@/features/requests/domain/policy';
export async function GET(request: Request) {
  try {
    const actor = await authenticated();
    const filters = listSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return NextResponse.json(container().requests.list(actor, filters), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const actor = await authenticated();
    return NextResponse.json(container().requests.create(actor, await jsonBody(request)), {
      status: 201,
    });
  } catch (e) {
    return failure(e);
  }
}
