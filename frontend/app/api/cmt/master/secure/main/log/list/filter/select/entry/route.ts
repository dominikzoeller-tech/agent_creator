import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterSelectEntry } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-select-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterSelectEntry());
}
