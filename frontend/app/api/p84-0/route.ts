import { NextResponse } from 'next/server';
import { getP840Boundary } from '../../../lib/p84-0-store';

export async function GET() {
  return NextResponse.json(getP840Boundary());
}
