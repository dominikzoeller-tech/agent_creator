import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListStatus());
}
