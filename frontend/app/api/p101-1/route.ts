import { NextResponse } from 'next/server';
import { getP1011Audit } from '../../../lib/p101-1-store';

export async function GET() {
  return NextResponse.json(getP1011Audit());
}
