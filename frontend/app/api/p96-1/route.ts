import { NextResponse } from 'next/server';
import { getP961Audit } from '../../../lib/p96-1-store';

export async function GET() {
  return NextResponse.json(getP961Audit());
}
