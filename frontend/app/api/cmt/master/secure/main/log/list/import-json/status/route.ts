import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-import-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportStatus());
}
