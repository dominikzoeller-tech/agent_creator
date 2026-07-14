import { NextResponse } from 'next/server';
import { getP830Boundary } from '../../../lib/p83-0-store';

export async function GET() {
  return NextResponse.json(getP830Boundary());
}
