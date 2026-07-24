import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterSelectStatus } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-select-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterSelectStatus());
}
