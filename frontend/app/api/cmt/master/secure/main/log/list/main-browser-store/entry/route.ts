import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogMainBrowserStoreEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-main-browser-store-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogMainBrowserStoreEntry());
}
