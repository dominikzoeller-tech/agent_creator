
import {
  shouldInvokeCouncil,
  runCouncil,
  renderCouncilMarkdown,
  type CouncilResult,
  type LLMFn,
} from "./council-engine";
import { realLLM } from "./real-llm";
import {
  type OutputMode,
  type AgentJsonResponse,
  buildCompactDirectResponse,
  buildCompactCouncilResponse,
  buildDebugCouncilResponse,
} from "./agent-response";
import { appendDecisionLog } from "./decision-log";

export type MasterRoute = "direct" | "council";

export interface MasterAgentInput {
  userInput: string;
  context?: string[];
  outputMode?: OutputMode;
  includeCouncilResult?: boolean; // nur für JSON relevant
}

export interface MasterAgentMarkdownResult {
  route: MasterRoute;
  format: "markdown";
  answer: string;
  councilResult?: CouncilResult;
}

export type MasterAgentResult = MasterAgentMarkdownResult | AgentJsonResponse;

function buildDirectAnswerPrompt(userInput: string, context: string[] = []): string {
  const contextBlock =
    context.length > 0
      ? `Zusätzlicher Kontext:\n- ${context.join("\n- ")}\n`
      : "Zusätzlicher Kontext: keiner\n";

  return [
    "Du bist ein Master-Agent.",
    "Du bist die primäre Benutzerinstanz.",
    "Antworte direkt, klar, hilfreich und auf Deutsch.",
    "Nutze KEINE Rat-Struktur.",
    "Wenn die Anfrage eine Faktenfrage oder Erklärfrage ist, gib eine direkte sachliche Antwort.",
    "Wenn die Anfrage keine Ratsfrage ist, führe KEIN Mehrperspektiven-Format aus.",
    "Wenn die Anfrage unklar ist, triff vernünftige Annahmen statt unnötig viele Rückfragen zu stellen.",
    "",
    contextBlock,
    "Nutzeranfrage:",
    userInput,
  ].join("\n");
}

function buildMasterCouncilAnswer(result: CouncilResult): string {
  const topAgreement = result.agreement.slice(0, 3).map(item => `- ${item}`).join("\n");

  const confidenceText =
    typeof result.confidence === "number"
      ? `${Math.round(result.confidence * 100)}%`
      : "nicht berechnet";

  return [
    "# Master-Agent",
    "",
    "## Einschätzung",
    "Ich habe den Rat intern zugeschaltet, weil hier eine echte Entscheidung mit Tradeoff und möglichem Fehlerkosteneffekt vorliegt.",
    "",
    "## Meine Empfehlung",
    result.recommendation,
    "",
    "## Warum ich dazu komme",
    topAgreement || "- Mehrere Perspektiven sehen hier eine echte Entscheidungsfrage.",
    "",
    "## Der erste Schritt",
    result.firstStep,
    "",
    "## Konfidenz",
    confidenceText,
    "",
    "## Ratsprotokoll",
    renderCouncilMarkdown(result),
  ].join("\n");
}

async function logCouncilDecision(params: {
  userInput: string;
  context?: string[];
  councilResult: CouncilResult;
}): Promise<void> {
  const { userInput, context = [], councilResult } = params;

  try {
    await appendDecisionLog({
      timestamp: new Date().toISOString(),
      route: "council",
      userInput,
      recommendation: councilResult.recommendation ?? null,
      firstStep: councilResult.firstStep ?? null,
      confidence:
        typeof councilResult.confidence === "number" ? councilResult.confidence : null,
      context,
      extractedOptions: councilResult.extractedOptions ?? [],
    });
  } catch (error) {
    console.warn("\n[master-agent] Warnung: Decision Log konnte nicht geschrieben werden.");
    console.warn(error);
  }
}

export async function runMasterAgent(
  input: MasterAgentInput,
  llm: LLMFn = realLLM
): Promise<MasterAgentResult> {
  const {
    userInput,
    context = [],
    outputMode = "markdown",
    includeCouncilResult = false,
  } = input;

  const useCouncil = shouldInvokeCouncil(userInput, context);

  if (!useCouncil) {
    const answer = await llm(buildDirectAnswerPrompt(userInput, context));

    if (outputMode === "json") {
      return buildCompactDirectResponse(answer);
    }

    return {
      route: "direct",
      format: "markdown",
      answer,
    };
  }

  const councilResult = await runCouncil(
    {
      userQuestion: userInput,
      context,
    },
    llm
  );

  await logCouncilDecision({
    userInput,
    context,
    councilResult,
  });

  if (outputMode === "json") {
    if (includeCouncilResult) {
      return buildDebugCouncilResponse(
        councilResult.recommendation,
        councilResult.firstStep,
        typeof councilResult.confidence === "number" ? councilResult.confidence : null,
        councilResult
      );
    }

    return buildCompactCouncilResponse(
      councilResult.recommendation,
      councilResult.firstStep,
      typeof councilResult.confidence === "number" ? councilResult.confidence : null
    );
  }

  return {
    route: "council",
    format: "markdown",
    councilResult,
    answer: buildMasterCouncilAnswer(councilResult),
  };
}
