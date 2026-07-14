import { NextResponse } from 'next/server';
import { getP860Boundary } from '../../../lib/p86-0-store';

export async function GET() {
  return NextResponse.json(getP860Boundary());
}
