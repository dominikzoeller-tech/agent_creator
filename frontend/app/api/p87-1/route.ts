import { NextResponse } from 'next/server';
import { getP871Audit } from '../../../lib/p87-1-store';

export async function GET() {
  return NextResponse.json(getP871Audit());
}
