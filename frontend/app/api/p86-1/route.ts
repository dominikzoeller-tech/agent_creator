import { NextResponse } from 'next/server';
import { getP861Audit } from '../../../lib/p86-1-store';

export async function GET() {
  return NextResponse.json(getP861Audit());
}
