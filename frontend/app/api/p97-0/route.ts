import { NextResponse } from 'next/server';
import { getP970Receipt } from '../../../lib/p97-0-store';

export async function GET() {
  return NextResponse.json(getP970Receipt());
}
