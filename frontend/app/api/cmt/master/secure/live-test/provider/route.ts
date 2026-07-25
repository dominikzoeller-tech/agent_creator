import { NextResponse } from 'next/server';
import { buildSafeLiveTestPrompt, createLiveProviderGate, type SecureMasterLiveProviderResponse } from '../../../../../../../lib/cmt-secure-master-live-provider-gate';

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const input = typeof body?.input === 'string' ? body.input : '';
  const gate = createLiveProviderGate(input);

  if (!gate.providerCallAllowed) {
    const blocked: SecureMasterLiveProviderResponse = {
      ok: false,
      liveProviderPathPrepared: true,
      providerCallAttempted: false,
      providerCallAllowed: false,
      gate,
      blockedReasons: gate.blockedReasons,
    };
    return NextResponse.json(blocked, { status: 200 });
  }

  const baseUrl = process.env.PROVIDER_BASE_URL || 'https://api.openai.com/v1/chat/completions';
  const apiKey = process.env.PROVIDER_API_KEY || '';
  const model = gate.modelName;
  const maxTokens = Number(process.env.PROVIDER_MAX_TOKENS || '300');
  const timeoutMs = Number(process.env.PROVIDER_TIMEOUT_MS || '30000');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        messages: buildSafeLiveTestPrompt(input),
        max_tokens: maxTokens,
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    const data: any = await response.json().catch(() => ({}));
    const answer = data?.choices?.[0]?.message?.content || data?.output_text || '';

    const result: SecureMasterLiveProviderResponse = {
      ok: response.ok,
      liveProviderPathPrepared: true,
      providerCallAttempted: true,
      providerCallAllowed: true,
      gate,
      answer: answer || 'Provider antwortete ohne auslesbaren Inhalt.',
      error: response.ok ? undefined : 'provider_http_' + response.status,
    };
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    const result: SecureMasterLiveProviderResponse = {
      ok: false,
      liveProviderPathPrepared: true,
      providerCallAttempted: true,
      providerCallAllowed: true,
      gate,
      error: error?.name === 'AbortError' ? 'provider_timeout' : 'provider_call_failed',
    };
    return NextResponse.json(result, { status: 200 });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const gate = createLiveProviderGate('');
  return NextResponse.json({
    ok: true,
    liveProviderPathPrepared: true,
    providerCallAllowed: false,
    currentGate: gate,
    message: 'POST mit harmloser Testfrage erforderlich. Provider-Call nur bei expliziten ENV-Gates.',
  });
}
