import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

function isAllowedName(name: string): boolean {
  return /^[a-zA-Z0-9._\- ()]+$/.test(name) && (name.endsWith('.csv') || name.endsWith('.xlsx'));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") ?? "";

  if (!name || !isAllowedName(name)) {
    return new Response("Ungültiger Dateiname.", { status: 400 });
  }

  const filePath = path.join(process.cwd(), "..", "logs", name);

  try {
    const buffer = await readFile(filePath);
    const contentType = name.toLowerCase().endsWith('.csv')
      ? 'text/csv; charset=utf-8'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Datei nicht gefunden.", { status: 404 });
  }
}
