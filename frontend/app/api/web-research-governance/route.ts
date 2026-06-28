import { evaluateWebResearchGovernance } from "../../../lib/web-research-governance";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const report = evaluateWebResearchGovernance(body);
    return Response.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Web Research Governance konnte nicht ausgeführt werden.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
