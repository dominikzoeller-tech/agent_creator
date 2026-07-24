import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterStatus } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterStatus());
}
