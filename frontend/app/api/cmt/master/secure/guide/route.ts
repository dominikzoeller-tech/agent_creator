import { NextResponse } from 'next/server';
import { getSecureMasterGuide } from '../../../../../../lib/cmt-master-secure-guide';

export async function GET() {
  return NextResponse.json(getSecureMasterGuide());
}
