import { NextResponse } from 'next/server';
import { getP951Audit } from '../../../lib/p95-1-store';

export async function GET() {
  return NextResponse.json(getP951Audit());
}
