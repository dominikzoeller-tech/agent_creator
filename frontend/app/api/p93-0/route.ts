import { NextResponse } from 'next/server';
import { getP930Receipt } from '../../../lib/p93-0-store';

export async function GET() {
  return NextResponse.json(getP930Receipt());
}
