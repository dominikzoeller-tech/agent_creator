import { RoutingDetails } from "./agent-routing-details";

export interface CouncilRoutingResponseMetadata {
  suggestedAgents: string[];
  routingDetails: RoutingDetails;
  routingSummary: string;
}

export interface CouncilRoutingResponseEnvelope<T extends object> extends CouncilRoutingResponseMetadata {
  result: T;
}

export function attachCouncilRoutingMetadata<T extends object>(
  result: T,
  metadata: CouncilRoutingResponseMetadata
): T & CouncilRoutingResponseMetadata {
  return {
    ...result,
    suggestedAgents: metadata.suggestedAgents,
    routingDetails: metadata.routingDetails,
    routingSummary: metadata.routingSummary,
  };
}
