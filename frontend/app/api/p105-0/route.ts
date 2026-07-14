import { NextResponse } from 'next/server';
import { getP1050Boundary } from '../../../lib/p105-0-store';

export async function GET() {
  return NextResponse.json(getP1050Boundary());
}
