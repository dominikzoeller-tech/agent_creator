import { buildSessionSummaryToMemory } from "../../../lib/session-summary-to-memory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "25");
    const save = url.searchParams.get("save") === "true";

    const result = await buildSessionSummaryToMemory({
      limit: Number.isFinite(limit) ? Math.max(1, Math.min(limit, 200)) : 25,
      save,
      logsDir: process.env.LOGS_DIR || "/logs",
      memoryDir: process.env.MEMORY_DIR || "/memory",
    });

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Session Summary konnte nicht erstellt werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { limit?: number; save?: boolean };
    const result = await buildSessionSummaryToMemory({
      limit: typeof body.limit === "number" ? Math.max(1, Math.min(body.limit, 200)) : 25,
      save: body.save === true,
      logsDir: process.env.LOGS_DIR || "/logs",
      memoryDir: process.env.MEMORY_DIR || "/memory",
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Session Summary konnte nicht gespeichert werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
