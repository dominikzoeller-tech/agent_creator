import { NextResponse } from 'next/server';
import { getP960Boundary } from '../../../lib/p96-0-store';

export async function GET() {
  return NextResponse.json(getP960Boundary());
}
