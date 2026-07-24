import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-import-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportEntry());
}
