import { runToolPreflight } from "../../../lib/tool-preflight";
import { ProcessingMode, SensitivityLevel } from "../../../lib/tool-permissions";

export const dynamic = "force-dynamic";

function normalizeSensitivity(value: unknown): SensitivityLevel {
  if (value === "public" || value === "internal" || value === "confidential") return value;
  return "internal";
}

function normalizeMode(value: unknown): ProcessingMode {
  if (value === "auto" || value === "local" || value === "cloud" || value === "hybrid") return value;
  return "auto";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const result = runToolPreflight({
      toolId: url.searchParams.get("toolId") ?? "",
      userInput: url.searchParams.get("userInput") ?? "",
      sensitivity: normalizeSensitivity(url.searchParams.get("sensitivity")),
      processingMode: normalizeMode(url.searchParams.get("processingMode")),
      requireConfirmation: url.searchParams.get("requireConfirmation") === "true",
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool Preflight konnte nicht ausgeführt werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = runToolPreflight({
      toolId: typeof body.toolId === "string" ? body.toolId : "",
      userInput: typeof body.userInput === "string" ? body.userInput : "",
      sensitivity: normalizeSensitivity(body.sensitivity),
      processingMode: normalizeMode(body.processingMode),
      requireConfirmation: body.requireConfirmation === true,
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool Preflight konnte nicht ausgeführt werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
