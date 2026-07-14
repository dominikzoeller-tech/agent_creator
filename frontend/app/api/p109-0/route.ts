import { NextResponse } from 'next/server';
import { getP1090Boundary } from '../../../lib/p109-0-store';

export async function GET() {
  return NextResponse.json(getP1090Boundary());
}
