import { NextResponse } from 'next/server';
import { getCommitteeLandingGuide } from '../../../../../lib/cmt-land-guide';

export async function GET() {
  return NextResponse.json(getCommitteeLandingGuide());
}
