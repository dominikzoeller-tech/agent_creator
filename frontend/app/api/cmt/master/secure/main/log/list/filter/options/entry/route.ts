import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterOptionsEntry } from '../../../../../../../../../../../lib/cmt-master-answer-log-list-filter-options-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterOptionsEntry());
}
