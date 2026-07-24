import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonExportStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-export-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonExportStatus());
}
