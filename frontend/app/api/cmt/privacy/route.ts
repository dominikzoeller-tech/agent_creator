import { NextResponse } from 'next/server';
import { evaluatePrivacyGate, getPrivacyGateDemo } from '../../../../lib/cmt-privacy-gate';

export async function GET() {
  return NextResponse.json(getPrivacyGateDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  return NextResponse.json(evaluatePrivacyGate(input));
}
