import { searchKnowledgeBase, KnowledgeSearchResult } from "./knowledge-base";

export interface KnowledgeRoutingContextOptions {
  limit?: number;
  minScore?: number;
  tags?: string[];
}

export interface KnowledgeRoutingContext {
  query: string;
  hits: KnowledgeSearchResult[];
  contextLines: string[];
  summary: string;
  hasHits: boolean;
}

export async function buildKnowledgeRoutingContext(
  userInput: string,
  options: KnowledgeRoutingContextOptions = {}
): Promise<KnowledgeRoutingContext> {
  const limit = options.limit ?? 3;
  const minScore = options.minScore ?? 1;
  const hits = (await searchKnowledgeBase(userInput, {
    limit,
    tags: options.tags,
  })).filter((hit) => hit.score >= minScore);

  const contextLines = hits.map((hit, index) => {
    const tags = hit.tags.length > 0 ? ` | Tags: ${hit.tags.join(", ")}` : "";
    return `Knowledge ${index + 1}: ${hit.title}${tags} | Score: ${hit.score} | ${hit.snippet}`;
  });

  return {
    query: userInput,
    hits,
    contextLines,
    summary: buildSummary(hits),
    hasHits: hits.length > 0,
  };
}

export function mergeKnowledgeContext(existingContext: string[] = [], knowledge: KnowledgeRoutingContext): string[] {
  if (!knowledge.hasHits) return [...existingContext];

  return [
    ...existingContext,
    "Lokaler Knowledge-Base-Kontext:",
    ...knowledge.contextLines,
  ];
}

function buildSummary(hits: KnowledgeSearchResult[]): string {
  if (hits.length === 0) {
    return "Keine lokalen Knowledge-Base-Treffer gefunden.";
  }

  const titles = hits.map((hit) => `${hit.title} (${hit.score})`).join(", ");
  return `Lokale Knowledge-Base-Treffer: ${titles}.`;
}
