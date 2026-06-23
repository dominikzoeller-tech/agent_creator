
import type { CouncilResult } from "./council-engine";

export type MasterRoute = "direct" | "council";
export type OutputMode = "markdown" | "json";

export interface BaseAgentResponse {
  route: MasterRoute;
  format: "json";
  usedCouncil: boolean;
  answer: string;
  recommendation: string | null;
  firstStep: string | null;
  confidence: number | null;
}

export interface CompactAgentResponse extends BaseAgentResponse {
  councilResult?: never;
}

export interface DebugAgentResponse extends BaseAgentResponse {
  councilResult: CouncilResult;
}

export type AgentJsonResponse = CompactAgentResponse | DebugAgentResponse;

export function buildCompactDirectResponse(answer: string): CompactAgentResponse {
  return {
    route: "direct",
    format: "json",
    usedCouncil: false,
    answer,
    recommendation: null,
    firstStep: null,
    confidence: null,
  };
}

export function buildCompactCouncilResponse(
  recommendation: string,
  firstStep: string,
  confidence: number | null
): CompactAgentResponse {
  return {
    route: "council",
    format: "json",
    usedCouncil: true,
    answer: recommendation,
    recommendation,
    firstStep,
    confidence,
  };
}

export function buildDebugCouncilResponse(
  recommendation: string,
  firstStep: string,
  confidence: number | null,
  councilResult: CouncilResult
): DebugAgentResponse {
  return {
    route: "council",
    format: "json",
    usedCouncil: true,
    answer: recommendation,
    recommendation,
    firstStep,
    confidence,
    councilResult,
  };
}
