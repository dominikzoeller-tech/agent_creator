import { NextResponse } from 'next/server';
import { createCommitteeAskState, getCommitteeAskDemo } from '../../../../lib/cmt-ask';

export async function GET() {
  return NextResponse.json(getCommitteeAskDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeAskState(text));
}
