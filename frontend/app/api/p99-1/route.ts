import { NextResponse } from 'next/server';
import { getP991Audit } from '../../../lib/p99-1-store';

export async function GET() {
  return NextResponse.json(getP991Audit());
}
