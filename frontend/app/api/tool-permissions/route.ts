import { buildToolPermissionsMatrix, ProcessingMode, SensitivityLevel } from "../../../lib/tool-permissions";

export const dynamic = "force-dynamic";

function normalizeSensitivity(value: string | null): SensitivityLevel {
  if (value === "public" || value === "internal" || value === "confidential") return value;
  return "internal";
}

function normalizeMode(value: string | null): ProcessingMode {
  if (value === "auto" || value === "local" || value === "cloud" || value === "hybrid") return value;
  return "auto";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sensitivity = normalizeSensitivity(url.searchParams.get("sensitivity"));
    const processingMode = normalizeMode(url.searchParams.get("processingMode"));
    return Response.json(buildToolPermissionsMatrix(sensitivity, processingMode));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool Permissions konnten nicht berechnet werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
