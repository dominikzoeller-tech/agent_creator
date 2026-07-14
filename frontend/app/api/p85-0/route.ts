import { NextResponse } from 'next/server';
import { getP850Receipt } from '../../../lib/p85-0-store';

export async function GET() {
  return NextResponse.json(getP850Receipt());
}
