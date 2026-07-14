import { NextResponse } from 'next/server';
import { getP1021Audit } from '../../../lib/p102-1-store';

export async function GET() {
  return NextResponse.json(getP1021Audit());
}
