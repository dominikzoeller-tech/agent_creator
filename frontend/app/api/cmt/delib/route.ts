import { NextResponse } from 'next/server';
import { createCommitteeDeliberation, getCommitteeDeliberationDemo } from '../../../../lib/cmt-delib';

export async function GET() {
  return NextResponse.json(getCommitteeDeliberationDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeDeliberation(text));
}
