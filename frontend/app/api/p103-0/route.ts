import { NextResponse } from 'next/server';
import { getP1030Boundary } from '../../../lib/p103-0-store';

export async function GET() {
  return NextResponse.json(getP1030Boundary());
}
