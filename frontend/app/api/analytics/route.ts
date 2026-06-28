import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

interface DecisionLogEntry {
  timestamp: string;
  route: "direct" | "council";
  userInput: string;
  recommendation?: string | null;
  firstStep?: string | null;
  confidence?: number | null;
  extractedOptions?: string[];
  suggestedAgents?: string[];
  usedKnowledge?: boolean;
  knowledgeSummary?: string;
  knowledgeHits?: { id?: string; title?: string; sourcePath?: string; score?: number; snippet?: string; tags?: string[] }[];
  usedMemory?: boolean;
  usedWebResearch?: boolean;
  webResearchEnabled?: boolean;
  webResearchQuery?: string;
  webResearchMessage?: string;
  webResearchResults?: { title?: string; url?: string; snippet?: string; source?: string }[];
  usedWebResearchSummary?: boolean;
  webResearchSummary?: string;
  webResearchSummaryMessage?: string;
  webResearchSources?: { title?: string; url?: string; source?: string }[];
  toolPreflight?: {
  toolEnforcement?: { enabled?: boolean; dryRun?: boolean; wouldBlock?: boolean; blockedToolIds?: string[]; allowedToolIds?: string[]; confirmationRequiredToolIds?: string[]; reasons?: string[]; warnings?: string[]; mode?: string };
    candidateToolIds?: string[];
    allowedToolIds?: string[];
    blockedToolIds?: string[];
    decisions?: Array<{ toolId?: string; label?: string; candidate?: boolean; allowed?: boolean; requiresConfirmation?: boolean; reasons?: string[]; warnings?: string[]; riskLevel?: string }>;
  };
  memorySummary?: string;
  memoryHits?: { id?: string; type?: string; title?: string; summary?: string; tags?: string[]; source?: string }[];
  routingSummary?: string;
  routingDetails?: {
    complexity?: string;
    privacyRisk?: string;
    decisionNeed?: boolean;
    implementationNeed?: boolean;
    planningNeed?: boolean;
    riskNeed?: boolean;
  };
}

type DecisionLogEntryWithToolEnforcement = DecisionLogEntry & {
  toolEnforcement?: {
    enabled?: boolean;
    dryRun?: boolean;
    wouldBlock?: boolean;
    blockedToolIds?: string[];
    allowedToolIds?: string[];
    confirmationRequiredToolIds?: string[];
    reasons?: string[];
    warnings?: string[];
    mode?: string;
  };
};

function round(value: number, digits = 2) {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function inferPattern(entry: DecisionLogEntry): string {
  if (entry.extractedOptions && entry.extractedOptions.length >= 2) {
    return [...entry.extractedOptions]
      .map((option) => option.trim())
      .filter(Boolean)
      .sort((a, b) => normalizeText(a).localeCompare(normalizeText(b)))
      .join(" ⇄ ");
  }
  return normalizeText(entry.userInput).slice(0, 100);
}

function toTopItems(values: string[], limit = 5) {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = value.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const route = url.searchParams.get("route") ?? "all";
  const search = normalizeText(url.searchParams.get("search") ?? "");
  const logPath = path.join(process.cwd(), "..", "logs", "decision-log.jsonl");

  try {
    const raw = await readFile(logPath, "utf8");
    let entries: DecisionLogEntry[] = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as DecisionLogEntry;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as DecisionLogEntry[];

    if (route === "direct" || route === "council") {
      entries = entries.filter((entry) => entry.route === route);
    }

    if (search) {
      entries = entries.filter((entry) => {
        const haystack = normalizeText(
          [entry.userInput, entry.recommendation, entry.firstStep, entry.routingSummary, ...(entry.extractedOptions ?? []), ...(entry.suggestedAgents ?? [])]
            .filter(Boolean)
            .join(" ")
        );
        return haystack.includes(search);
      });
    }

    const totalEntries = entries.length;
    const directEntries = entries.filter((entry) => entry.route === "direct");
    const councilEntries = entries.filter((entry) => entry.route === "council");
    const knowledgeUsedEntries = entries.filter((entry) => entry.usedKnowledge === true || (entry.knowledgeHits?.length ?? 0) > 0);
    const knowledgeUsedCount = knowledgeUsedEntries.length;
    const knowledgeUsedSharePercent = totalEntries > 0 ? round((knowledgeUsedCount / totalEntries) * 100) : 0;
    const memoryUsedEntries = entries.filter((entry) => entry.usedMemory === true || (entry.memoryHits?.length ?? 0) > 0);
    const memoryUsedCount = memoryUsedEntries.length;
    const memoryUsedSharePercent = totalEntries > 0 ? round((memoryUsedCount / totalEntries) * 100) : 0;
    const webResearchIntentEntries = entries.filter((entry) => Boolean(entry.webResearchQuery));
    const webResearchUsedEntries = entries.filter((entry) => entry.usedWebResearch === true || (entry.webResearchResults?.length ?? 0) > 0);
    const webResearchSummaryEntries = entries.filter((entry) => entry.usedWebResearchSummary === true || Boolean(entry.webResearchSummary));
    const webResearchUsedCount = webResearchUsedEntries.length;
    const webResearchUsedSharePercent = totalEntries > 0 ? round((webResearchUsedCount / totalEntries) * 100) : 0;
    const webResearchSummaryUsedCount = webResearchSummaryEntries.length;
    const webResearchSummarySuccessPercent = webResearchUsedCount > 0 ? round((webResearchSummaryUsedCount / webResearchUsedCount) * 100) : 0;
    const toolPreflightEntries = entries.filter((entry) => Boolean(entry.toolPreflight));
    const toolPreflightEntriesCount = toolPreflightEntries.length;
    const toolPreflightCandidateCount = toolPreflightEntries.reduce((sum, entry) => sum + (entry.toolPreflight?.candidateToolIds?.length ?? 0), 0);
    const toolPreflightAllowedCandidateCount = toolPreflightEntries.reduce((sum, entry) => sum + (entry.toolPreflight?.allowedToolIds?.length ?? 0), 0);
    const toolPreflightBlockedCandidateCount = toolPreflightEntries.reduce((sum, entry) => sum + (entry.toolPreflight?.blockedToolIds?.length ?? 0), 0);
    const toolPreflightBlockedSharePercent = toolPreflightCandidateCount > 0 ? round((toolPreflightBlockedCandidateCount / toolPreflightCandidateCount) * 100) : 0;
    const toolPreflightHighRiskCandidateCount = toolPreflightEntries.reduce((sum, entry) => sum + (entry.toolPreflight?.decisions ?? []).filter((decision) => decision.candidate === true && decision.requiresConfirmation === true).length, 0);
    const entriesWithToolEnforcement = entries as DecisionLogEntryWithToolEnforcement[];
    const toolEnforcementEntries = entriesWithToolEnforcement.filter((entry) => Boolean(entry.toolEnforcement));
    const toolEnforcementEntriesCount = toolEnforcementEntries.length;
    const toolEnforcementWouldBlockCount = toolEnforcementEntries.filter((entry) => entry.toolEnforcement?.wouldBlock === true).length;
    const toolEnforcementWouldBlockSharePercent = toolEnforcementEntriesCount > 0 ? round((toolEnforcementWouldBlockCount / toolEnforcementEntriesCount) * 100) : 0;
    const toolEnforcementDryRunCount = toolEnforcementEntries.filter((entry) => entry.toolEnforcement?.mode === "dry-run").length;
    const toolEnforcementEnforceModeCount = toolEnforcementEntries.filter((entry) => entry.toolEnforcement?.mode === "enforce").length;
    const toolEnforcementOffModeCount = toolEnforcementEntries.filter((entry) => entry.toolEnforcement?.mode === "off").length;
    const toolEnforcementConfirmationRequiredCount = toolEnforcementEntries.reduce((sum, entry) => sum + (entry.toolEnforcement?.confirmationRequiredToolIds?.length ?? 0), 0);
    const directCount = directEntries.length;
    const councilCount = councilEntries.length;
    const directSharePercent = totalEntries > 0 ? round((directCount / totalEntries) * 100) : 0;
    const councilSharePercent = totalEntries > 0 ? round((councilCount / totalEntries) * 100) : 0;

    const confidences = councilEntries.map((entry) => entry.confidence).filter((value): value is number => typeof value === "number");
    const avgCouncilConfidencePercent = confidences.length > 0
      ? round((confidences.reduce((acc, value) => acc + value, 0) / confidences.length) * 100)
      : null;

    const topRecommendations = toTopItems(councilEntries.map((entry) => entry.recommendation ?? ""), 5);
    const topFirstSteps = toTopItems(councilEntries.map((entry) => entry.firstStep ?? ""), 5);
    const topSuggestedAgents = toTopItems(councilEntries.flatMap((entry) => entry.suggestedAgents ?? []), 10);
    const topRoutingComplexities = toTopItems(councilEntries.map((entry) => entry.routingDetails?.complexity ?? ""), 5);
    const topPrivacyRisks = toTopItems(councilEntries.map((entry) => entry.routingDetails?.privacyRisk ?? ""), 5);
    const topKnowledgeFiles = toTopItems(knowledgeUsedEntries.flatMap((entry) => (entry.knowledgeHits ?? []).map((hit) => hit.title ?? hit.sourcePath ?? hit.id ?? "")), 10);
    const topKnowledgeTags = toTopItems(knowledgeUsedEntries.flatMap((entry) => (entry.knowledgeHits ?? []).flatMap((hit) => hit.tags ?? [])), 10);
    const topMemoryTypes = toTopItems(memoryUsedEntries.flatMap((entry) => (entry.memoryHits ?? []).map((hit) => hit.type ?? "")), 10);
    const topMemoryTags = toTopItems(memoryUsedEntries.flatMap((entry) => (entry.memoryHits ?? []).flatMap((hit) => hit.tags ?? [])), 10);
    const topMemoryTitles = toTopItems(memoryUsedEntries.flatMap((entry) => (entry.memoryHits ?? []).map((hit) => hit.title ?? hit.id ?? "")), 10);
    const topWebResearchQueries = toTopItems(webResearchIntentEntries.map((entry) => entry.webResearchQuery ?? ""), 10);
    const topWebResearchSources = toTopItems(webResearchUsedEntries.flatMap((entry) => (entry.webResearchSources ?? []).map((source) => source.source ?? source.url ?? "")), 10);
    const topWebResearchTitles = toTopItems(webResearchUsedEntries.flatMap((entry) => (entry.webResearchResults ?? []).map((result) => result.title ?? result.url ?? "")), 10);
    const topToolPreflightCandidates = toTopItems(toolPreflightEntries.flatMap((entry) => entry.toolPreflight?.candidateToolIds ?? []), 10);
    const topToolPreflightBlockedTools = toTopItems(toolPreflightEntries.flatMap((entry) => entry.toolPreflight?.blockedToolIds ?? []), 10);
    const topToolPreflightAllowedTools = toTopItems(toolPreflightEntries.flatMap((entry) => entry.toolPreflight?.allowedToolIds ?? []), 10);
    const topToolPreflightBlockReasons = toTopItems(toolPreflightEntries.flatMap((entry) => (entry.toolPreflight?.decisions ?? []).flatMap((decision) => decision.candidate === true && decision.allowed === false ? (decision.reasons ?? []) : [])), 10);
    const topToolPreflightWarnings = toTopItems(toolPreflightEntries.flatMap((entry) => (entry.toolPreflight?.decisions ?? []).flatMap((decision) => decision.candidate === true ? (decision.warnings ?? []) : [])), 10);
    const topToolEnforcementBlockedTools = toTopItems(toolEnforcementEntries.flatMap((entry) => entry.toolEnforcement?.blockedToolIds ?? []), 10);
    const topToolEnforcementAllowedTools = toTopItems(toolEnforcementEntries.flatMap((entry) => entry.toolEnforcement?.allowedToolIds ?? []), 10);
    const topToolEnforcementConfirmationTools = toTopItems(toolEnforcementEntries.flatMap((entry) => entry.toolEnforcement?.confirmationRequiredToolIds ?? []), 10);
    const topToolEnforcementReasons = toTopItems(toolEnforcementEntries.flatMap((entry) => entry.toolEnforcement?.reasons ?? []), 10);
    const topToolEnforcementWarnings = toTopItems(toolEnforcementEntries.flatMap((entry) => entry.toolEnforcement?.warnings ?? []), 10);
    const topToolEnforcementModes = toTopItems(toolEnforcementEntries.map((entry) => entry.toolEnforcement?.mode ?? ""), 5);

    const patternMap = new Map<string, { count: number; confidences: number[]; exampleQuestion: string }>();
    for (const entry of councilEntries) {
      const pattern = inferPattern(entry);
      const current = patternMap.get(pattern) ?? { count: 0, confidences: [], exampleQuestion: entry.userInput };
      current.count += 1;
      if (typeof entry.confidence === "number") current.confidences.push(entry.confidence * 100);
      patternMap.set(pattern, current);
    }

    const topPatterns = Array.from(patternMap.entries())
      .map(([pattern, value]) => ({
        pattern,
        count: value.count,
        avgConfidencePercent: value.confidences.length > 0 ? round(value.confidences.reduce((a, b) => a + b, 0) / value.confidences.length) : null,
        exampleQuestion: value.exampleQuestion,
      }))
      .sort((a, b) => b.count - a.count || a.pattern.localeCompare(b.pattern))
      .slice(0, 5);

    return Response.json({
      ok: true,
      totalEntries,
      directCount,
      councilCount,
      directSharePercent,
      councilSharePercent,
      avgCouncilConfidencePercent,
      knowledgeUsedCount,
      knowledgeUsedSharePercent,
      memoryUsedCount,
      memoryUsedSharePercent,
      webResearchUsedCount,
      webResearchUsedSharePercent,
      webResearchSummaryUsedCount,
      webResearchSummarySuccessPercent,
      toolPreflightEntriesCount,
      toolPreflightCandidateCount,
      toolPreflightAllowedCandidateCount,
      toolPreflightBlockedCandidateCount,
      toolPreflightBlockedSharePercent,
      toolPreflightHighRiskCandidateCount,
      toolEnforcementEntriesCount,
      toolEnforcementWouldBlockCount,
      toolEnforcementWouldBlockSharePercent,
      toolEnforcementDryRunCount,
      toolEnforcementEnforceModeCount,
      toolEnforcementOffModeCount,
      toolEnforcementConfirmationRequiredCount,
      topRecommendations,
      topFirstSteps,
      topSuggestedAgents,
      topRoutingComplexities,
      topPrivacyRisks,
      topKnowledgeFiles,
      topKnowledgeTags,
      topMemoryTypes,
      topMemoryTags,
      topMemoryTitles,
      topWebResearchQueries,
      topWebResearchSources,
      topWebResearchTitles,
      topToolPreflightCandidates,
      topToolPreflightBlockedTools,
      topToolPreflightAllowedTools,
      topToolPreflightBlockReasons,
      topToolPreflightWarnings,
      topToolEnforcementBlockedTools,
      topToolEnforcementAllowedTools,
      topToolEnforcementConfirmationTools,
      topToolEnforcementReasons,
      topToolEnforcementWarnings,
      topToolEnforcementModes,
      topPatterns,
      filters: { route, search },
    });
  } catch {
    return Response.json({
      ok: true,
      totalEntries: 0,
      directCount: 0,
      councilCount: 0,
      directSharePercent: 0,
      councilSharePercent: 0,
      avgCouncilConfidencePercent: null,
      knowledgeUsedCount: 0,
      knowledgeUsedSharePercent: 0,
      memoryUsedCount: 0,
      memoryUsedSharePercent: 0,
      webResearchUsedCount: 0,
      webResearchUsedSharePercent: 0,
      webResearchSummaryUsedCount: 0,
      webResearchSummarySuccessPercent: 0,
      toolPreflightEntriesCount: 0,
      toolPreflightCandidateCount: 0,
      toolPreflightAllowedCandidateCount: 0,
      toolPreflightBlockedCandidateCount: 0,
      toolPreflightBlockedSharePercent: 0,
      toolPreflightHighRiskCandidateCount: 0,
      toolEnforcementEntriesCount: 0,
      toolEnforcementWouldBlockCount: 0,
      toolEnforcementWouldBlockSharePercent: 0,
      toolEnforcementDryRunCount: 0,
      toolEnforcementEnforceModeCount: 0,
      toolEnforcementOffModeCount: 0,
      toolEnforcementConfirmationRequiredCount: 0,
      topRecommendations: [],
      topFirstSteps: [],
      topSuggestedAgents: [],
      topRoutingComplexities: [],
      topPrivacyRisks: [],
      topKnowledgeFiles: [],
      topKnowledgeTags: [],
      topMemoryTypes: [],
      topMemoryTags: [],
      topMemoryTitles: [],
      topWebResearchQueries: [],
      topWebResearchSources: [],
      topWebResearchTitles: [],
      topToolPreflightCandidates: [],
      topToolPreflightBlockedTools: [],
      topToolPreflightAllowedTools: [],
      topToolPreflightBlockReasons: [],
      topToolPreflightWarnings: [],
      topToolEnforcementBlockedTools: [],
      topToolEnforcementAllowedTools: [],
      topToolEnforcementConfirmationTools: [],
      topToolEnforcementReasons: [],
      topToolEnforcementWarnings: [],
      topToolEnforcementModes: [],
      topPatterns: [],
      filters: { route, search },
    });
  }
}
