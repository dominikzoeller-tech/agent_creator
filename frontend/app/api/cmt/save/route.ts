import { NextResponse } from 'next/server';
import { createCommitteeSavedSession, getCommitteeSavedSessionDemo } from '../../../../lib/cmt-save';

export async function GET() {
  return NextResponse.json(getCommitteeSavedSessionDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const questions = Array.isArray(body?.questions)
    ? body.questions.filter((item: unknown) => typeof item === 'string')
    : [];
  return NextResponse.json(createCommitteeSavedSession(questions));
}
