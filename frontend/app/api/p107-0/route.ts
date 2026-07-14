import { NextResponse } from 'next/server';
import { getP1070Boundary } from '../../../lib/p107-0-store';

export async function GET() {
  return NextResponse.json(getP1070Boundary());
}
