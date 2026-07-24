import { NextResponse } from 'next/server';
import { askSecureMasterCommittee, getSecureMasterCommitteeDemo } from '../../../../../../lib/cmt-master-committee';
import type { PrivacyDecisionOption } from '../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterCommitteeDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  const option = typeof body?.option === 'string' && options.includes(body.option) ? body.option : 'local_only';
  return NextResponse.json(askSecureMasterCommittee(input, option));
}
