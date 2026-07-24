import { NextResponse } from 'next/server';
import { getCommitteeLocalJsonStatus } from '../../../../../lib/cmt-json-status';

export async function GET() {
  return NextResponse.json(getCommitteeLocalJsonStatus());
}
