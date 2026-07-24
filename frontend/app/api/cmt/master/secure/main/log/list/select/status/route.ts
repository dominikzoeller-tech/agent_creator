import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListMainSelectStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-main-select-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListMainSelectStatus());
}
