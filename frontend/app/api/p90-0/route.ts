import { NextResponse } from 'next/server';
import { getP900Boundary } from '../../../lib/p90-0-store';

export async function GET() {
  return NextResponse.json(getP900Boundary());
}
