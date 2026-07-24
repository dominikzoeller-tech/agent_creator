import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogManualApplyBrowserLoadDemo, loadSecureMasterAnswerLogManualApplyFromBrowser } from '../../../../../../../../lib/cmt-master-answer-log-list-manual-apply-browser-load';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogManualApplyBrowserLoadDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(loadSecureMasterAnswerLogManualApplyFromBrowser({
    rawStoredValue: typeof body?.rawStoredValue === 'string' ? body.rawStoredValue : '',
  }));
}
