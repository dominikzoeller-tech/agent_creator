import { NextResponse } from 'next/server';
import { getP990Receipt } from '../../../lib/p99-0-store';

export async function GET() {
  return NextResponse.json(getP990Receipt());
}
