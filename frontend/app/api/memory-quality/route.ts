import { buildMemoryQualityReport } from "../../../lib/memory-quality";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = await buildMemoryQualityReport(process.env.MEMORY_FILE || "/memory/project-memory.json");
    return Response.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Memory Quality Report konnte nicht erstellt werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
