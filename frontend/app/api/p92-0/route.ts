import { NextResponse } from 'next/server';
import { getP920Boundary } from '../../../lib/p92-0-store';

export async function GET() {
  return NextResponse.json(getP920Boundary());
}
