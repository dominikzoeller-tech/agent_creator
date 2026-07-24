import { NextResponse } from 'next/server';
import { getCommitteeMainNav } from '../../../../lib/cmt-nav';

export async function GET() {
  return NextResponse.json(getCommitteeMainNav());
}
