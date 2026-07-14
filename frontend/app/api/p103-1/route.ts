import { NextResponse } from 'next/server';
import { getP1031Audit } from '../../../lib/p103-1-store';

export async function GET() {
  return NextResponse.json(getP1031Audit());
}
