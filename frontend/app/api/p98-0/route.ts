import { NextResponse } from 'next/server';
import { getP980Boundary } from '../../../lib/p98-0-store';

export async function GET() {
  return NextResponse.json(getP980Boundary());
}
