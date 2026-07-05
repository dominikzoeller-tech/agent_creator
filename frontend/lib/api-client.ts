import { AskRequestBody, AskResponse, HealthResponse, RedactResponse } from "./types";

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_AGENT_API_BASE_URL || "http://localhost:7071";

async function parseJsonSafe<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`UngÃ¼ltige JSON-Antwort von ${res.url}: ${text}`);
  }
}

export async function getHealth(baseUrl = DEFAULT_BASE_URL): Promise<HealthResponse> {
  const res = await fetch(`${baseUrl}/health`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Health-Request fehlgeschlagen (${res.status})`);
  return parseJsonSafe<HealthResponse>(res);
}

export async function askAgent(body: AskRequestBody, baseUrl = DEFAULT_BASE_URL): Promise<AskResponse> {
  const res = await fetch(`${baseUrl}/v1/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await parseJsonSafe<AskResponse>(res);
  if (!res.ok) {
    if (payload && typeof payload === "object" && "error" in payload) throw new Error(payload.error);
    throw new Error(`API-Request fehlgeschlagen (${res.status})`);
  }
  return payload;
}

export async function getRedactPreview(
  body: Pick<AskRequestBody, "userInput" | "context">,
  baseUrl = DEFAULT_BASE_URL
): Promise<RedactResponse> {
  const res = await fetch(`${baseUrl}/v1/redact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redact-Preview fehlgeschlagen (${res.status})`);
  return parseJsonSafe<RedactResponse>(res);
}

