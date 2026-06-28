import { saveWebResearch } from "../../../lib/web-research-save";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await saveWebResearch(body);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Web Research konnte nicht gespeichert werden.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
