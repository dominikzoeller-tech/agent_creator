import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportDemo, prepareSecureMasterAnswerLogJsonImport } from '../../../../../../../../lib/cmt-master-answer-log-list-json-import';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(prepareSecureMasterAnswerLogJsonImport({
    rawJson: typeof body?.rawJson === 'string' ? body.rawJson : '',
  }));
}
