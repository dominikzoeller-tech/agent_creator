import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogEntry } from '../../../../../../../../lib/cmt-master-answer-log-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogEntry());
}
