import { NextResponse } from 'next/server';
import { createCommitteeView, getCommitteeViewDemo } from '../../../../lib/cmt-view';

export async function GET() {
  return NextResponse.json(getCommitteeViewDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeView(text));
}
