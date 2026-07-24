import { NextResponse } from 'next/server';
import { getCommitteeLanding } from '../../../../lib/cmt-land';

export async function GET() {
  return NextResponse.json(getCommitteeLanding());
}
