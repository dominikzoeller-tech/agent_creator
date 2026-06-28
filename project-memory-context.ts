import { ProjectMemoryEntry, ProjectMemorySearchOptions, searchProjectMemory } from "./project-memory";

export interface ProjectMemoryContextOptions extends ProjectMemorySearchOptions {
  minHits?: number;
}

export interface ProjectMemoryContext {
  query: string;
  hits: ProjectMemoryEntry[];
  contextLines: string[];
  summary: string;
  hasHits: boolean;
}

export async function buildProjectMemoryContext(
  userInput: string,
  options: ProjectMemoryContextOptions = {}
): Promise<ProjectMemoryContext> {
  const hits = await searchProjectMemory(userInput, {
    limit: options.limit ?? 5,
    type: options.type,
    tags: options.tags,
  });

  const contextLines = hits.map((hit, index) => {
    const tags = hit.tags.length > 0 ? ` | Tags: ${hit.tags.join(", ")}` : "";
    const source = hit.source ? ` | Source: ${hit.source}` : "";
    return `Project Memory ${index + 1}: [${hit.type}] ${hit.title}${tags}${source} | ${hit.summary}`;
  });

  return {
    query: userInput,
    hits,
    contextLines,
    summary: buildMemorySummary(hits),
    hasHits: hits.length >= (options.minHits ?? 1),
  };
}

export function mergeProjectMemoryContext(
  existingContext: string[] = [],
  memory: ProjectMemoryContext
): string[] {
  if (!memory.hasHits) return [...existingContext];

  return [
    ...existingContext,
    "Lokaler Project-Memory-Kontext:",
    ...memory.contextLines,
  ];
}

function buildMemorySummary(hits: ProjectMemoryEntry[]): string {
  if (hits.length === 0) {
    return "Keine Project-Memory-Treffer gefunden.";
  }

  const titles = hits.map((hit) => `${hit.title} [${hit.type}]`).join(", ");
  return `Project-Memory-Treffer: ${titles}.`;
}
