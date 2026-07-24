import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogBrowserStoreEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-browser-store-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogBrowserStoreEntry());
}
