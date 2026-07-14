import { NextResponse } from 'next/server';
import { getP870Receipt } from '../../../lib/p87-0-store';

export async function GET() {
  return NextResponse.json(getP870Receipt());
}
