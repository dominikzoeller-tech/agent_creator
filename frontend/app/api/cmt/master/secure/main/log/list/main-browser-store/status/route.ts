import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogMainBrowserStoreStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-main-browser-store-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogMainBrowserStoreStatus());
}
