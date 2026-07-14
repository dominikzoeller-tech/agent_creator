import { NextResponse } from 'next/server';
import { getP901Audit } from '../../../lib/p90-1-store';

export async function GET() {
  return NextResponse.json(getP901Audit());
}
