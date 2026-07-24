import { NextResponse } from 'next/server';
import { createCommitteeMvpDemo, getCommitteeMvpDemo } from '../../../../lib/cmt-demo';

export async function GET() {
  return NextResponse.json(getCommitteeMvpDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeMvpDemo(text));
}
