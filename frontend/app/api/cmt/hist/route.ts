import { NextResponse } from 'next/server';
import { createCommitteeHistory, getCommitteeHistoryDemo } from '../../../../lib/cmt-hist';

export async function GET() {
  return NextResponse.json(getCommitteeHistoryDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const questions = Array.isArray(body?.questions)
    ? body.questions.filter((item: unknown) => typeof item === 'string')
    : [];
  return NextResponse.json(createCommitteeHistory(questions));
}
