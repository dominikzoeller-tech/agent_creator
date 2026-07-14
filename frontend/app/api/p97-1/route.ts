import { NextResponse } from 'next/server';
import { getP971Audit } from '../../../lib/p97-1-store';

export async function GET() {
  return NextResponse.json(getP971Audit());
}
