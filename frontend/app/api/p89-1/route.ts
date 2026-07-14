import { NextResponse } from 'next/server';
import { getP891Audit } from '../../../lib/p89-1-store';

export async function GET() {
  return NextResponse.json(getP891Audit());
}
