import { NextResponse } from 'next/server';
import { getP1080Boundary } from '../../../lib/p108-0-store';

export async function GET() {
  return NextResponse.json(getP1080Boundary());
}
