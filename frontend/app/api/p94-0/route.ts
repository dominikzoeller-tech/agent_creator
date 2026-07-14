import { NextResponse } from 'next/server';
import { getP940Boundary } from '../../../lib/p94-0-store';

export async function GET() {
  return NextResponse.json(getP940Boundary());
}
