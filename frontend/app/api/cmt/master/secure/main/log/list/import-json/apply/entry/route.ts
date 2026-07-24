import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportApplyEntry } from '../../../../../../../../../../lib/cmt-master-answer-log-list-json-import-apply-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportApplyEntry());
}
