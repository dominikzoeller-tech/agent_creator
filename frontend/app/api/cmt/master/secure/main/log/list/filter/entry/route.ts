import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterEntry } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterEntry());
}
