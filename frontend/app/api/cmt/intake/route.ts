import { NextResponse } from 'next/server';
import { createCommitteeQuestion, getCommitteeIntakeDemo } from '../../../../lib/cmt-intake';

export async function GET() {
  return NextResponse.json(getCommitteeIntakeDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeQuestion(text));
}
