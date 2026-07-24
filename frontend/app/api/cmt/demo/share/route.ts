import { NextResponse } from 'next/server';
import { createCommitteeDemoShare, getCommitteeDemoShare } from '../../../../../lib/cmt-demo-share';

export async function GET() {
  return NextResponse.json(getCommitteeDemoShare());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeDemoShare(text));
}
