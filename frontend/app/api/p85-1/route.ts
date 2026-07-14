import { NextResponse } from 'next/server';
import { getP851Audit } from '../../../lib/p85-1-store';

export async function GET() {
  return NextResponse.json(getP851Audit());
}
