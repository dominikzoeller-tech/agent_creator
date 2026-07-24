import { NextResponse } from 'next/server';
import { createCommitteeRun, getCommitteeRunDemo } from '../../../../lib/cmt-run';

export async function GET() {
  return NextResponse.json(getCommitteeRunDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeRun(text));
}
