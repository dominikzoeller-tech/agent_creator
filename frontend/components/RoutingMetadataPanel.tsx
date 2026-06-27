import { AskResponse, RoutingDetails } from "../lib/types";

interface RoutingMetadataPanelProps {
  response: AskResponse | null;
}

interface ExtractedRoutingMetadata {
  suggestedAgents?: string[];
  routingDetails?: RoutingDetails;
  routingSummary?: string;
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
};

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  padding: "6px 10px",
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
};

const infoBoxStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  padding: 14,
  lineHeight: 1.55,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractRoutingMetadata(response: AskResponse | null): ExtractedRoutingMetadata | null {
  if (!response || response.ok === false) return null;

  if (response.mode === "cloud") {
    const result = response.result as unknown;
    if (isObject(result)) {
      const directMetadata: ExtractedRoutingMetadata = {
        suggestedAgents: Array.isArray(result.suggestedAgents) ? result.suggestedAgents as string[] : undefined,
        routingDetails: isObject(result.routingDetails) ? result.routingDetails as unknown as RoutingDetails : undefined,
        routingSummary: typeof result.routingSummary === "string" ? result.routingSummary : undefined,
      };

      if (directMetadata.suggestedAgents || directMetadata.routingDetails || directMetadata.routingSummary) {
        return directMetadata;
      }

      const councilResult = result.councilResult;
      if (isObject(councilResult)) {
        const councilMetadata: ExtractedRoutingMetadata = {
          suggestedAgents: Array.isArray(councilResult.suggestedAgents) ? councilResult.suggestedAgents as string[] : undefined,
          routingDetails: isObject(councilResult.routingDetails) ? councilResult.routingDetails as unknown as RoutingDetails : undefined,
          routingSummary: typeof councilResult.routingSummary === "string" ? councilResult.routingSummary : undefined,
        };

        if (councilMetadata.suggestedAgents || councilMetadata.routingDetails || councilMetadata.routingSummary) {
          return councilMetadata;
        }
      }
    }
  }

  if (response.mode === "local_policy") {
    return {
      suggestedAgents: ["privacy_agent", "risk_agent"],
      routingSummary: `Route: ${response.routeSuggestion} | Processing Path: ${response.processingPath}`,
      routingDetails: undefined,
    };
  }

  return null;
}

export function RoutingMetadataPanel({ response }: RoutingMetadataPanelProps) {
  const metadata = extractRoutingMetadata(response);

  if (!metadata) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Routing-Metadaten</h2>
        <div className="helper-text">
          Noch keine Routing-Metadaten sichtbar. Aktiviere bei Council-Tests optional <strong>includeCouncilResult</strong>,
          damit die API die neuen Agent-/Routing-Felder vollständig zurückliefert.
        </div>
      </section>
    );
  }

  const details = metadata.routingDetails;
  const agents = metadata.suggestedAgents ?? [];

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Routing-Metadaten</h2>

      {metadata.routingSummary ? (
        <div style={{ ...infoBoxStyle, marginBottom: 14 }}>
          <strong>Summary:</strong> {metadata.routingSummary}
        </div>
      ) : null}

      {agents.length > 0 ? (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>
            Suggested Agents
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {agents.map((agent) => (
              <span key={agent} style={chipStyle}>{agent}</span>
            ))}
          </div>
        </div>
      ) : null}

      {details ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div style={infoBoxStyle}><strong>Route:</strong><br />{details.route}</div>
          <div style={infoBoxStyle}><strong>Komplexität:</strong><br />{details.complexity}</div>
          <div style={infoBoxStyle}><strong>Privacy-Risiko:</strong><br />{details.privacyRisk}</div>
          <div style={infoBoxStyle}><strong>Decision Need:</strong><br />{details.decisionNeed ? "ja" : "nein"}</div>
          <div style={infoBoxStyle}><strong>Implementation Need:</strong><br />{details.implementationNeed ? "ja" : "nein"}</div>
          <div style={infoBoxStyle}><strong>Planning Need:</strong><br />{details.planningNeed ? "ja" : "nein"}</div>
          <div style={infoBoxStyle}><strong>Risk Need:</strong><br />{details.riskNeed ? "ja" : "nein"}</div>
          <div style={{ ...infoBoxStyle, gridColumn: "1 / -1" }}><strong>Reason:</strong><br />{details.reason}</div>
        </div>
      ) : null}
    </section>
  );
}
