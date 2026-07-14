import { NextResponse } from 'next/server';
import { getP911Audit } from '../../../lib/p91-1-store';

export async function GET() {
  return NextResponse.json(getP911Audit());
}
