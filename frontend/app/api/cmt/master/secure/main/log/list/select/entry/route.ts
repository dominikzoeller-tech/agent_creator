import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListMainSelectEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-main-select-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListMainSelectEntry());
}
