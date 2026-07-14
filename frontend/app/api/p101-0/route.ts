import { NextResponse } from 'next/server';
import { getP1010Boundary } from '../../../lib/p101-0-store';

export async function GET() {
  return NextResponse.json(getP1010Boundary());
}
