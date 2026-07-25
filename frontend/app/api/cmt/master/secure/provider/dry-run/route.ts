import { NextResponse } from 'next/server';
import { createSecureMasterServerProviderDryRunEnvelope } from '../../../../../../../lib/cmt-secure-master-server-provider-dry-run';

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const inputPreview = typeof body?.inputPreview === 'string' ? body.inputPreview : '';
  const approvalDecision = typeof body?.approvalDecision === 'string' ? body.approvalDecision : 'local_only';

  return NextResponse.json(createSecureMasterServerProviderDryRunEnvelope(inputPreview, approvalDecision), { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpointPrepared: true,
    method: 'POST',
    providerCallAllowed: false,
    liveModelEnabled: false,
    externalSharingAllowed: false,
    dryRunOnly: true,
    message: 'Secure Master server provider dry-run endpoint is prepared and blocked for real provider calls.',
  });
}
