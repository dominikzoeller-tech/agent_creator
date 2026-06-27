import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  const logsDir = path.join(process.cwd(), "..", "logs");

  try {
    const entries = await readdir(logsDir, { withFileTypes: true });
    const exportFiles = [] as Array<{
      name: string;
      size: number;
      modifiedAt: string;
      kind: "csv" | "xlsx";
    }>;

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const lower = entry.name.toLowerCase();
      const kind = lower.endsWith(".csv") ? "csv" : lower.endsWith(".xlsx") ? "xlsx" : null;
      if (!kind) continue;

      const filePath = path.join(logsDir, entry.name);
      const info = await stat(filePath);
      exportFiles.push({
        name: entry.name,
        size: info.size,
        modifiedAt: info.mtime.toISOString(),
        kind,
      });
    }

    exportFiles.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    return Response.json({ ok: true, files: exportFiles });
  } catch {
    return Response.json({ ok: true, files: [] });
  }
}
