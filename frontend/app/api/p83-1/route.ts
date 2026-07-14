import { NextResponse } from 'next/server';
import { getP831Audit } from '../../../lib/p83-1-store';

export async function GET() {
  return NextResponse.json(getP831Audit());
}
