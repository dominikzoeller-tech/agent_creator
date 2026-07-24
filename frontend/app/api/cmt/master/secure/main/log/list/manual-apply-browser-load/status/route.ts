import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogManualApplyBrowserLoadStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-manual-apply-browser-load-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogManualApplyBrowserLoadStatus());
}
