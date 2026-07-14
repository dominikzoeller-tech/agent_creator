import { NextResponse } from 'next/server';
import { getP890Receipt } from '../../../lib/p89-0-store';

export async function GET() {
  return NextResponse.json(getP890Receipt());
}
