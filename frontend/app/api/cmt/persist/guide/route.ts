import { NextResponse } from 'next/server';
import { getCommitteePersistGuide } from '../../../../../lib/cmt-persist-guide';

export async function GET() {
  return NextResponse.json(getCommitteePersistGuide());
}
