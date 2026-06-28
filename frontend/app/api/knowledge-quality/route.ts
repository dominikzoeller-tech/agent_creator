import { buildKnowledgeQualityReport } from "../../../lib/knowledge-quality";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = await buildKnowledgeQualityReport(process.env.KNOWLEDGE_DIR || "/knowledge");
    return Response.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Knowledge Quality Report konnte nicht erstellt werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
