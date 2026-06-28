import { buildToolRegistry } from "../../../lib/tool-registry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(buildToolRegistry());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool Registry konnte nicht gelesen werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
