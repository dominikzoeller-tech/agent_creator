import { NextResponse } from 'next/server';
import { getP931Audit } from '../../../lib/p93-1-store';

export async function GET() {
  return NextResponse.json(getP931Audit());
}
