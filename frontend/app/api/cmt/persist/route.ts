import { NextResponse } from 'next/server';
import { createCommitteePersistAdapter, getCommitteePersistAdapterDemo } from '../../../../lib/cmt-persist';

export async function GET() {
  return NextResponse.json(getCommitteePersistAdapterDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const questions = Array.isArray(body?.questions)
    ? body.questions.filter((item: unknown) => typeof item === 'string')
    : [];
  return NextResponse.json(createCommitteePersistAdapter(questions));
}
