import { NextResponse } from 'next/server';
import { createSecureMasterAnswerLogList, getSecureMasterAnswerLogListDemo } from '../../../../../../../../lib/cmt-master-answer-log-list';
import type { PrivacyDecisionOption } from '../../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.map((item: any) => ({
    input: typeof item?.input === 'string' ? item.input : '',
    option: typeof item?.option === 'string' && options.includes(item.option) ? item.option : 'local_only',
  }));
  return NextResponse.json(createSecureMasterAnswerLogList(items));
}
