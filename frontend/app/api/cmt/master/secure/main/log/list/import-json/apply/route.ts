import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportApplyDemo, prepareSecureMasterAnswerLogJsonImportApply } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-import-apply';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportApplyDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(prepareSecureMasterAnswerLogJsonImportApply({
    rawJson: typeof body?.rawJson === 'string' ? body.rawJson : '',
  }));
}
