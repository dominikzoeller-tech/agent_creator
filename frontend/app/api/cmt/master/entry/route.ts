import { NextResponse } from 'next/server';
import { getMasterAgentEntry } from '../../../../../lib/cmt-master-entry';

export async function GET() {
  return NextResponse.json(getMasterAgentEntry());
}
