import { runWebResearch } from "../../../lib/web-research";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    const count = Number(url.searchParams.get("count") ?? "5");
    const result = await runWebResearch({ query, count });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Web Research konnte nicht ausgeführt werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string; count?: number };
    const result = await runWebResearch({ query: body.query ?? "", count: body.count ?? 5 });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Web Research konnte nicht ausgeführt werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
