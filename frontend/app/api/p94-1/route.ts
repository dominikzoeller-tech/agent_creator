import { NextResponse } from 'next/server';
import { getP941Audit } from '../../../lib/p94-1-store';

export async function GET() {
  return NextResponse.json(getP941Audit());
}
