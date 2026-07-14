import { NextResponse } from 'next/server';
import { getP950Receipt } from '../../../lib/p95-0-store';

export async function GET() {
  return NextResponse.json(getP950Receipt());
}
