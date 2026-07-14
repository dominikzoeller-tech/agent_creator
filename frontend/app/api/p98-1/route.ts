import { NextResponse } from 'next/server';
import { getP981Audit } from '../../../lib/p98-1-store';

export async function GET() {
  return NextResponse.json(getP981Audit());
}
