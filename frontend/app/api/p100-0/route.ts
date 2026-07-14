import { NextResponse } from 'next/server';
import { getP1000Boundary } from '../../../lib/p100-0-store';

export async function GET() {
  return NextResponse.json(getP1000Boundary());
}
