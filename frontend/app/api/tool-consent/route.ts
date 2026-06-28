import { createToolConsentRequest, decideToolConsentRequest, listToolConsentRequests } from "../../../lib/tool-consent-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(listToolConsentRequests());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Consent Requests konnten nicht gelesen werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const toolId = typeof body.toolId === "string" ? body.toolId : "";
    if (!toolId.trim()) return Response.json({ ok: false, error: "toolId ist erforderlich." }, { status: 400 });
    const created = createToolConsentRequest({
      toolId,
      reason: typeof body.reason === "string" ? body.reason : undefined,
      userInputPreview: typeof body.userInputPreview === "string" ? body.userInputPreview : undefined,
      sensitivity: typeof body.sensitivity === "string" ? body.sensitivity : undefined,
      processingMode: typeof body.processingMode === "string" ? body.processingMode : undefined,
      ttlMinutes: typeof body.ttlMinutes === "number" ? body.ttlMinutes : undefined,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });
    return Response.json({ ok: true, request: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Consent Request konnte nicht erstellt werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const status = body.status === "approved" || body.status === "denied" ? body.status : null;
    if (!id || !status) return Response.json({ ok: false, error: "id und status approved/denied sind erforderlich." }, { status: 400 });
    const updated = decideToolConsentRequest({
      id,
      status,
      decisionNote: typeof body.decisionNote === "string" ? body.decisionNote : undefined,
    });
    if (!updated) return Response.json({ ok: false, error: "Consent Request nicht gefunden." }, { status: 404 });
    return Response.json({ ok: true, request: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Consent Request konnte nicht entschieden werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
