import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListEntry());
}
