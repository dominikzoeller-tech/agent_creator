import { getWebResearchSettingsStatus } from "../../../lib/web-research-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(getWebResearchSettingsStatus());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Web Research Settings konnten nicht gelesen werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
