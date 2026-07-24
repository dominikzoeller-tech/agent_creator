import { NextResponse } from 'next/server';
import { getCommitteePersistStatus } from '../../../../../lib/cmt-persist-status';

export async function GET() {
  return NextResponse.json(getCommitteePersistStatus());
}
