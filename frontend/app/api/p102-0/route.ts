import { NextResponse } from 'next/server';
import { getP1020Boundary } from '../../../lib/p102-0-store';

export async function GET() {
  return NextResponse.json(getP1020Boundary());
}
