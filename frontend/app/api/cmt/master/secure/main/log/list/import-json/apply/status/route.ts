import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportApplyStatus } from '../../../../../../../../../../lib/cmt-master-answer-log-list-json-import-apply-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportApplyStatus());
}
