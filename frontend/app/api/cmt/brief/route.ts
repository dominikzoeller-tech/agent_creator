import { NextResponse } from 'next/server';
import { createCommitteeBrief, getCommitteeBriefDemo } from '../../../../lib/cmt-brief';

export async function GET() {
  return NextResponse.json(getCommitteeBriefDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeBrief(text));
}
