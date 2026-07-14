import { NextResponse } from 'next/server';
import { getP910Receipt } from '../../../lib/p91-0-store';

export async function GET() {
  return NextResponse.json(getP910Receipt());
}
