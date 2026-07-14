import { NextResponse } from 'next/server';
import { getP1040Boundary } from '../../../lib/p104-0-store';

export async function GET() {
  return NextResponse.json(getP1040Boundary());
}
