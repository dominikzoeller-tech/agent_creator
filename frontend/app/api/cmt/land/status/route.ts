import { NextResponse } from 'next/server';
import { getCommitteeLandingStatus } from '../../../../../lib/cmt-land-status';

export async function GET() {
  return NextResponse.json(getCommitteeLandingStatus());
}
