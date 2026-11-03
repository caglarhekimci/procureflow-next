import { NextResponse } from 'next/server';
import { authenticated, assertOrigin, jsonBody, failure } from '@/shared/http';
import { container } from '@/infrastructure/container';
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  try {
    const actor = await authenticated();
    return NextResponse.json(container().requests.detail(actor, (await params).id), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    assertOrigin(request);
    const actor = await authenticated();
    return NextResponse.json(
      container().requests.transition(actor, (await params).id, await jsonBody(request)),
    );
  } catch (e) {
    return failure(e);
  }
}
