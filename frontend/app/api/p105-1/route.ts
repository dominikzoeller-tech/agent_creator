import { NextResponse } from 'next/server';
import { getP1051Audit } from '../../../lib/p105-1-store';

export async function GET() {
  return NextResponse.json(getP1051Audit());
}
