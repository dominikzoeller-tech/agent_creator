import { NextResponse } from 'next/server';
import { getP1071Audit } from '../../../lib/p107-1-store';

export async function GET() {
  return NextResponse.json(getP1071Audit());
}
