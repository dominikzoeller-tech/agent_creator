import { NextResponse } from 'next/server';
import { getP841Audit } from '../../../lib/p84-1-store';

export async function GET() {
  return NextResponse.json(getP841Audit());
}
