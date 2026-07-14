import { NextResponse } from 'next/server';
import { getP1001Audit } from '../../../lib/p100-1-store';

export async function GET() {
  return NextResponse.json(getP1001Audit());
}
