import { NextResponse } from 'next/server';
import { askCommitteeLocal, getCommitteeAskDemo } from '../../../../lib/cmt-ask';

export async function GET() {
  return NextResponse.json(getCommitteeAskDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body?.question === 'string' ? body.question : '';
  return NextResponse.json(askCommitteeLocal(question));
}
