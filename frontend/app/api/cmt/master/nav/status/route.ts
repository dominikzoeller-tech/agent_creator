import { NextResponse } from 'next/server';
import { getSecureMasterNavStatus } from '../../../../../lib/cmt-master-nav-status';

export async function GET() {
  return NextResponse.json(getSecureMasterNavStatus());
}
