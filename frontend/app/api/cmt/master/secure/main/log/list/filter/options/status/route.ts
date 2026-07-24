import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterOptionsStatus } from '../../../../../../../../../../../lib/cmt-master-answer-log-list-filter-options-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterOptionsStatus());
}
