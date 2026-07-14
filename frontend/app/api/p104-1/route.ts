import { NextResponse } from 'next/server';
import { getP1041Audit } from '../../../lib/p104-1-store';

export async function GET() {
  return NextResponse.json(getP1041Audit());
}
