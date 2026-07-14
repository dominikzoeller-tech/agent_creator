import { NextResponse } from 'next/server';
import { getP881Audit } from '../../../lib/p88-1-store';

export async function GET() {
  return NextResponse.json(getP881Audit());
}
