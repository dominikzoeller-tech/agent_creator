import { NextResponse } from 'next/server';
import { createCommitteeDecisionResult, getCommitteeDecisionResultDemo } from '../../../../lib/cmt-result';

export async function GET() {
  return NextResponse.json(getCommitteeDecisionResultDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeDecisionResult(text));
}
