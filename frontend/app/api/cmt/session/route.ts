import { NextResponse } from 'next/server';
import { createCommitteeSession, getCommitteeSessionDemo } from '../../../../lib/cmt-session';

export async function GET() {
  return NextResponse.json(getCommitteeSessionDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeSession(text));
}
