import { NextResponse } from 'next/server';
import { decidePrivacyAction, getPrivacyDecisionDemo, type PrivacyDecisionOption } from '../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getPrivacyDecisionDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  const requested = typeof body?.option === 'string' && options.includes(body.option)
    ? body.option
    : 'local_only';
  return NextResponse.json(decidePrivacyAction(input, requested));
}
