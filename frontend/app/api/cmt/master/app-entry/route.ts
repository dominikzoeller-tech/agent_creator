import { NextResponse } from 'next/server';
import { getSecureMasterAppEntry } from '../../../../lib/cmt-master-app-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAppEntry());
}
