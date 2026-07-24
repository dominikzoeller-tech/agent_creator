import { NextResponse } from 'next/server';
import { getCommitteeAppEntry } from '../../../../lib/cmt-app-entry';

export async function GET() {
  return NextResponse.json(getCommitteeAppEntry());
}
