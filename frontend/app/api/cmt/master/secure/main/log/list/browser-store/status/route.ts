import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogBrowserStoreStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-browser-store-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogBrowserStoreStatus());
}
