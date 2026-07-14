import { NextResponse } from 'next/server';
import { getP1060Boundary } from '../../../lib/p106-0-store';

export async function GET() {
  return NextResponse.json(getP1060Boundary());
}
