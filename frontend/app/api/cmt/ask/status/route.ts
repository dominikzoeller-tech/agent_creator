import { NextResponse } from 'next/server';
import { getCommitteeAskStatus } from '../../../../../lib/cmt-ask-status';

export async function GET() {
  return NextResponse.json(getCommitteeAskStatus());
}
