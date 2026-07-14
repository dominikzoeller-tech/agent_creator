import { NextResponse } from 'next/server';
import { getP880Boundary } from '../../../lib/p88-0-store';

export async function GET() {
  return NextResponse.json(getP880Boundary());
}
