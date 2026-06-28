export type DataSensitivity = "public" | "internal" | "confidential" | "restricted";
export type ProcessingMode = "auto" | "local_only" | "hybrid" | "cloud_allowed";
export type ProcessingPath = "cloud_raw" | "cloud_redacted" | "local_policy";
export type RouteType = "direct" | "council";
export type OutputMode = "json" | "markdown";
export type RoutingLevel = "low" | "medium" | "high";

export interface RoutingDetails {
  route: RouteType;
  reason: string;
  suggestedAgents: string[];
  complexity: RoutingLevel;
  privacyRisk: RoutingLevel;
  decisionNeed: boolean;
  implementationNeed: boolean;
  planningNeed: boolean;
  riskNeed: boolean;
}


export type ProjectMemoryType =
  | "decision"
  | "milestone"
  | "issue"
  | "preference"
  | "system-state"
  | "note";


export interface WebResearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface WebResearchSource {
  title: string;
  url: string;
  source?: string;
}

export interface ProjectMemoryEntry {
  id: string;
  type: ProjectMemoryType;
  title: string;
  summary: string;
  tags: string[];
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSearchResult {
  id: string;
  title: string;
  sourcePath: string;
  score: number;
  snippet: string;
  tags: string[];
}

export interface HealthResponse {
  ok: boolean;
  service: string;
  status: string;
  port: number;
  modes: {
    sensitivities: DataSensitivity[];
    processingModes: ProcessingMode[];
    processingPaths: ProcessingPath[];
  };
}

export interface AskRequestBody {
  userInput: string;
  context?: string[];
  outputMode: OutputMode;
  includeCouncilResult: boolean;
  sensitivity: DataSensitivity;
  processingMode: ProcessingMode;
  allowCloudForSensitive: boolean;
}

export interface CloudAskResult {
  route: RouteType;
  format: OutputMode;
  usedCouncil: boolean;
  answer: string;
  recommendation?: string | null;
  firstStep?: string | null;
  confidence?: number | null;
  suggestedAgents?: string[];
  routingDetails?: RoutingDetails;
  routingSummary?: string;
  councilResult?: unknown;
  usedKnowledge?: boolean;
  knowledgeSummary?: string;
  knowledgeHits?: KnowledgeSearchResult[];
  usedMemory?: boolean;
  memorySummary?: string;
  memoryHits?: ProjectMemoryEntry[];
  usedWebResearch?: boolean;
  webResearchEnabled?: boolean;
  webResearchQuery?: string;
  webResearchMessage?: string;
  webResearchResults?: WebResearchResult[];
  usedWebResearchSummary?: boolean;
  webResearchSummary?: string;
  webResearchSummaryMessage?: string;
  webResearchSources?: WebResearchSource[];
}

export interface CloudAskResponse {
  ok: true;
  mode: "cloud";
  sensitivity: DataSensitivity;
  processingMode: ProcessingMode;
  processingPath: ProcessingPath;
  redacted: boolean;
  result: CloudAskResult;
}

export interface LocalPolicyResponse {
  ok: true;
  mode: "local_policy";
  sensitivity: DataSensitivity;
  processingMode: ProcessingMode;
  processingPath: ProcessingPath;
  routeSuggestion: RouteType;
  answer: string;
  reason: string;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
}

export interface DecisionLogEntry {
  timestamp: string;
  route: RouteType;
  userInput: string;
  recommendation?: string | null;
  firstStep?: string | null;
  confidence?: number | null;
  context?: string[];
  extractedOptions?: string[];
  suggestedAgents?: string[];
}

export interface TopItem {
  label: string;
  count: number;
}

export interface PatternItem {
  pattern: string;
  count: number;
  avgConfidencePercent: number | null;
  exampleQuestion: string;
}

export interface AnalyticsResponse {
  ok: true;
  totalEntries: number;
  directCount: number;
  councilCount: number;
  directSharePercent: number;
  councilSharePercent: number;
  avgCouncilConfidencePercent: number | null;
  knowledgeUsedCount?: number;
  knowledgeUsedSharePercent?: number;
  memoryUsedCount?: number;
  memoryUsedSharePercent?: number;
  topRecommendations: TopItem[];
  topFirstSteps: TopItem[];
  topSuggestedAgents?: TopItem[];
  topRoutingComplexities?: TopItem[];
  topPrivacyRisks?: TopItem[];
  topKnowledgeFiles?: TopItem[];
  topKnowledgeTags?: TopItem[];
  topMemoryTypes?: TopItem[];
  topMemoryTags?: TopItem[];
  topMemoryTitles?: TopItem[];
  topPatterns: PatternItem[];
  filters?: {
    route: "all" | RouteType;
    search: string;
  };
}

export interface RedactResponse {
  ok: true;
  original: string;
  redacted: string;
  redactedContext: string[];
}

export interface ExportFileEntry {
  name: string;
  size: number;
  modifiedAt: string;
  kind: "csv" | "xlsx";
}

export type AskResponse = CloudAskResponse | LocalPolicyResponse | ApiErrorResponse;
