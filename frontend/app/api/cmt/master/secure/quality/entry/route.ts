import { NextResponse } from 'next/server';
import { getSecureMasterQualityEntry } from '../../../../../../../lib/cmt-master-quality-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterQualityEntry());
}
