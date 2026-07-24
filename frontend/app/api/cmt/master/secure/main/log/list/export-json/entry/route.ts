import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonExportEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-export-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonExportEntry());
}
