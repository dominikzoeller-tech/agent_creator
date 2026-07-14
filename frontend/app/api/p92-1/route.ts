import { NextResponse } from 'next/server';
import { getP921Audit } from '../../../lib/p92-1-store';

export async function GET() {
  return NextResponse.json(getP921Audit());
}
