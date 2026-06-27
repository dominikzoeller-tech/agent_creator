import { analyzeCouncilRouting, DataSensitivity, ProcessingMode, RoutingDetails } from "./agent-routing-details";

export interface CouncilRoutingMetadataInput {
  userInput: string;
  sensitivity?: DataSensitivity;
  processingMode?: ProcessingMode;
  includeCouncilResult?: boolean;
}

export interface CouncilRoutingMetadata {
  routingDetails: RoutingDetails;
  suggestedAgents: string[];
  routeSuggestion: "direct" | "council";
  shouldUseCouncil: boolean;
  summary: string;
}

export function buildCouncilRoutingMetadata(input: CouncilRoutingMetadataInput): CouncilRoutingMetadata {
  const routingDetails = analyzeCouncilRouting(input);
  const shouldUseCouncil = routingDetails.route === "council";

  return {
    routingDetails,
    suggestedAgents: routingDetails.suggestedAgents,
    routeSuggestion: routingDetails.route,
    shouldUseCouncil,
    summary: buildSummary(routingDetails),
  };
}

function buildSummary(routingDetails: RoutingDetails): string {
  const agentText = routingDetails.suggestedAgents.length > 0
    ? routingDetails.suggestedAgents.join(", ")
    : "keine spezifischen Agenten";

  return [
    `Route: ${routingDetails.route}`,
    `Komplexität: ${routingDetails.complexity}`,
    `Privacy-Risiko: ${routingDetails.privacyRisk}`,
    `Agenten: ${agentText}`,
  ].join(" | ");
}
