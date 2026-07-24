import { NextResponse } from 'next/server';
import { askMasterAgentLocal, getMasterAgentDemo } from '../../../../lib/cmt-master';

export async function GET() {
  return NextResponse.json(getMasterAgentDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body?.question === 'string' ? body.question : '';
  return NextResponse.json(askMasterAgentLocal(question));
}
