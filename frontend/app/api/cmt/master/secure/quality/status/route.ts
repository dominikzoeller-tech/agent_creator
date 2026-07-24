import { NextResponse } from 'next/server';
import { getSecureMasterQualityStatus } from '../../../../../../../lib/cmt-master-quality-status';

export async function GET() {
  return NextResponse.json(getSecureMasterQualityStatus());
}
