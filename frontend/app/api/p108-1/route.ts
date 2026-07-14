import { NextResponse } from 'next/server';
import { getP1081Audit } from '../../../lib/p108-1-store';

export async function GET() {
  return NextResponse.json(getP1081Audit());
}
