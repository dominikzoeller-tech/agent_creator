import { NextResponse } from 'next/server';
import { getCommitteeLocalJsonGuide } from '../../../../../lib/cmt-json-guide';

export async function GET() {
  return NextResponse.json(getCommitteeLocalJsonGuide());
}
