import { NextResponse } from 'next/server';
import { getCommitteeCore } from '../../../lib/cmt-store';

export async function GET() {
  return NextResponse.json(getCommitteeCore());
}
