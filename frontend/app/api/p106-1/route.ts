import { NextResponse } from 'next/server';
import { getP1061Audit } from '../../../lib/p106-1-store';

export async function GET() {
  return NextResponse.json(getP1061Audit());
}
