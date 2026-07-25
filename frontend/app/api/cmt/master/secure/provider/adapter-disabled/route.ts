import { NextResponse } from 'next/server';
import { createDisabledProviderAdapterResponse } from '../../../../../../lib/cmt-secure-master-server-provider-adapter-disabled';

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const inputPreview = typeof body?.inputPreview === 'string' ? body.inputPreview : '';
  const approvalDecision = typeof body?.approvalDecision === 'string' ? body.approvalDecision : 'local_only';

  return NextResponse.json(createDisabledProviderAdapterResponse(inputPreview, approvalDecision), { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    adapterPrepared: true,
    adapterEnabled: false,
    dispatchAllowed: false,
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    secretsAccepted: false,
    message: 'Secure Master provider adapter endpoint is prepared but disabled for real provider calls.',
  });
}
