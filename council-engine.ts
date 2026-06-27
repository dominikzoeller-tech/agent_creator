import { buildCouncilRoutingMetadata } from "./council-routing-metadata";
import { RoutingDetails } from "./agent-routing-details";


export type CouncilRole =
  | "skeptiker"
  | "grundsatz_denker"
  | "visionaer"
  | "aussenstehender"
  | "macher";

export type IntentType = "factual" | "decision" | "creative" | "unclear";

export interface CouncilInput {
  userQuestion: string;
  context?: string[];
  stakes?: string;
  options?: string[];
  constraints?: string[];
}

export interface CouncilOpinion {
  role: CouncilRole;
  title: string;
  analysis: string;
}

export interface CouncilResult {
  framedQuestion: string;
  opinions: CouncilOpinion[];
  agreement: string[];
  disagreements: string[];
  missedThings: string[];
  recommendation: string;
  firstStep: string;
  confidence?: number; // 0 bis 1
  extractedOptions?: string[];
}

export type LLMFn = (prompt: string) => Promise<string>;

const ROLE_TITLES: Record<CouncilRole, string> = {
  skeptiker: "Der Skeptiker",
  grundsatz_denker: "Der Grundsatz-Denker",
  visionaer: "Der Visionär",
  aussenstehender: "Der Außenstehende",
  macher: "Der Macher",
};

const ROLE_INSTRUCTIONS: Record<CouncilRole, string> = {
  skeptiker:
    "Du bist Der Skeptiker. Suche aktiv nach Risiken, fehlenden Annahmen, Schwachstellen, versteckten Kosten und Gründen, warum die Idee scheitern könnte. Sei direkt, kritisch und bewusst einseitig. Du sollst nicht ausbalancieren.",
  grundsatz_denker:
    "Du bist Der Grundsatz-Denker. Zerlege das Problem auf seine Grundstruktur. Prüfe, ob überhaupt die richtige Frage gestellt wird. Entferne unnötige Annahmen und formuliere das Kernproblem klar. Du sollst nicht ausbalancieren.",
  visionaer:
    "Du bist Der Visionär. Suche das Upside, die unterschätzte Chance, asymmetrische Vorteile, Hebel und mögliche Skalierung. Blende das Risiko weitgehend aus. Du sollst nicht ausbalancieren.",
  aussenstehender:
    "Du bist Der Außenstehende. Du hast keinen Vor-Kontext außer dem, was hier steht. Reagiere mit frischem Blick. Achte auf Unklarheit, Fluch des Wissens, Verwirrung und fehlende Einfachheit. Du sollst nicht ausbalancieren.",
  macher:
    "Du bist Der Macher. Interessiere dich nur für Umsetzbarkeit, schnelle Tests, konkrete nächste Schritte und operative Klarheit. Theorie ist zweitrangig. Du sollst nicht ausbalancieren.",
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”„"]/g, '"')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanOption(option: string): string {
  return option
    .replace(/^[\s,.;:!?-]+/, "")
    .replace(/[\s,.;:!?-]+$/, "")
    .replace(/^dass\s+/i, "")
    .replace(/^ob\s+/i, "")
    .trim();
}

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;

    const key = normalizeText(trimmed);
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

/**
 * Extrahiert Optionen aus Formulierungen wie:
 * - "Soll ich X oder Y machen?"
 * - "X oder Y?"
 * - "Ist A besser als B?"
 */
export function extractOptionsFromQuestion(userQuestion: string): string[] {
  const q = userQuestion.trim();

  const patterns: RegExp[] = [
    /soll ich\s+(.+?)\s+oder\s+(.+?)(?:\?|$)/i,
    /ich überlege\s+(.+?)\s+oder\s+(.+?)(?:\?|$)/i,
    /ich bin hin- und hergerissen[: ]*\s*(.+?)\s+oder\s+(.+?)(?:\?|$)/i,
    /ich bin hin und hergerissen[: ]*\s*(.+?)\s+oder\s+(.+?)(?:\?|$)/i,
    /welche option[: ]+\s*(.+?)\s+oder\s+(.+?)(?:\?|$)/i,
    /ist\s+(.+?)\s+besser\s+als\s+(.+?)(?:\?|$)/i,
    /(.+?)\s+oder\s+(.+?)(?:\?|$)/i,
  ];

  for (const pattern of patterns) {
    const match = q.match(pattern);
    if (!match) continue;

    const left = cleanOption(match[1] || "");
    const right = cleanOption(match[2] || "");

    const options = uniqueNonEmpty([left, right]).filter(
      option => option.length >= 2 && option.length <= 160
    );

    if (options.length >= 2) {
      return options.slice(0, 4);
    }
  }

  return [];
}

function inferConstraints(userQuestion: string, context: string[] = []): string[] {
  const text = normalizeText([userQuestion, ...context].join(" | "));
  const constraints: string[] = [];

  if (text.includes("wenig zeit") || text.includes("keine zeit")) {
    constraints.push("Zeit ist knapp.");
  }

  if (text.includes("wenig budget") || text.includes("kein budget")) {
    constraints.push("Budget ist begrenzt.");
  }

  if (text.includes("schnell") || text.includes("sofort")) {
    constraints.push("Geschwindigkeit ist wichtig.");
  }

  if (text.includes("risikoarm") || text.includes("sicher") || text.includes("risikominimierung")) {
    constraints.push("Risikominimierung ist wichtig.");
  }

  if (text.includes("einfach") || text.includes("simpel")) {
    constraints.push("Einfache Umsetzbarkeit ist wichtig.");
  }

  return uniqueNonEmpty(constraints);
}

function guessStakes(userQuestion: string, context: string[] = []): string {
  const q = normalizeText([userQuestion, ...context].join(" "));

  if (
    q.includes("business") ||
    q.includes("angebot") ||
    q.includes("positionierung") ||
    q.includes("kunden") ||
    q.includes("launch") ||
    q.includes("launchen") ||
    q.includes("pivot")
  ) {
    return "Es geht um eine potenziell wichtige Business- oder Strategieentscheidung mit Kosten bei Fehlentscheidung.";
  }

  if (
    q.includes("job") ||
    q.includes("kündigen") ||
    q.includes("selbstständig") ||
    q.includes("bewerbung") ||
    q.includes("karriere")
  ) {
    return "Es geht um eine potenziell folgenreiche Karriere- oder Lebensentscheidung.";
  }

  if (
    q.includes("produkt") ||
    q.includes("feature") ||
    q.includes("roadmap") ||
    q.includes("priorisieren")
  ) {
    return "Es geht um eine Produkt- oder Priorisierungsentscheidung mit Opportunitätskosten.";
  }

  return "Es geht um eine Entscheidung mit Tradeoff, Unsicherheit oder potenziellen Folgekosten.";
}

function formatList(label: string, items?: string[]): string {
  if (!items || items.length === 0) {
    return `${label}: keine explizit genannt`;
  }

  return `${label}: ${items.join(" | ")}`;
}

/**
 * Klassifiziert NUR die Nutzerfrage.
 * Globaler Kontext wirkt bewusst NICHT dominierend.
 */

export function classifyIntent(userInput: string): IntentType {
  const normalized = normalizeText(userInput);

  const explicitCouncilTriggers = [
    "rat",
    "rat das",
    "rat das durch",
    "frag den rat",
    "ab in den rat",
    "der rat soll ran",
    "gremium",
    "gremium das",
    "ab ins gremium",
    "frag das gremium",
    "pressure-test das",
    "ich bin hin- und hergerissen",
    "ich bin hin und hergerissen",
    "ich kann mich nicht entscheiden",
    "was würdest du an meiner stelle tun",
    "welche option",
    "ist das der richtige move",
  ];

  if (explicitCouncilTriggers.some(trigger => normalized.includes(trigger))) {
    return "decision";
  }

  const factualStarts = [
    "was ist",
    "wie funktioniert",
    "wie funktionieren",
    "wie funktioniert ein",
    "wie funktioniert eine",
    "erkläre",
    "erklär mir",
    "definiere",
    "was bedeutet",
    "wann war",
    "wer ist",
    "fasse zusammen",
    "fass zusammen",
    "was ist der unterschied",
    "was ist der unterschied zwischen",
    "unterschied zwischen",
    "vergleich",
    "vergleiche",
  ];

  if (factualStarts.some(prefix => normalized.startsWith(prefix))) {
    return "factual";
  }

  const creativeStarts = [
    "schreib",
    "erstelle",
    "formuliere",
    "mach mir",
    "gib mir einen tweet",
    "gib mir einen post",
    "schreib mir",
  ];

  if (creativeStarts.some(prefix => normalized.startsWith(prefix))) {
    return "creative";
  }

  const decisionSignals = [
    "soll ich",
    "oder",
    "abwägen",
    "tradeoff",
    "entscheiden",
    "entscheidung",
    "option",
    "priorisieren",
    "wählen",
    "richtig move",
    "richtiger move",
  ];

  const score = decisionSignals.reduce((count, signal) => {
    return normalized.includes(signal) ? count + 1 : count;
  }, 0);

  if (score >= 2 || extractOptionsFromQuestion(userInput).length >= 2) {
    return "decision";
  }

  return "unclear";
}


/**
 * Robusteres Routing:
 * - userInput dominiert
 * - Kontext beeinflusst nur minimal
 * - Faktenfragen gehen standardmäßig DIRECT
 */
export function shouldInvokeCouncil(userInput: string, context: string[] = []): boolean {
  const normalizedInput = normalizeText(userInput);
  const normalizedContext = normalizeText(context.join(" "));

  const explicitCouncilTriggers = [
    "rat",
    "rat das",
    "rat das durch",
    "frag den rat",
    "ab in den rat",
    "der rat soll ran",
    "gremium",
    "gremium das",
    "ab ins gremium",
    "frag das gremium",
    "pressure-test das",
    "ich bin hin- und hergerissen",
    "ich bin hin und hergerissen",
    "ich kann mich nicht entscheiden",
    "was würdest du an meiner stelle tun",
    "welche option",
    "ist das der richtige move",
  ];

  if (explicitCouncilTriggers.some(trigger => normalizedInput.includes(trigger))) {
    return true;
  }

  const intent = classifyIntent(userInput);

  // Harte Bremse für Faktenfragen / kreative Aufgaben,
  // solange kein expliziter Rat-Trigger vorhanden ist.
  if (intent === "factual" || intent === "creative") {
    return false;
  }

  let score = 0;

  if (intent === "decision") {
    score += 3;
  }

  const decisionSignals = [
    "soll ich",
    "oder",
    "abwägen",
    "tradeoff",
    "entscheiden",
    "entscheidung",
    "option",
    "priorisieren",
    "wählen",
    "hin- und hergerissen",
    "hin und hergerissen",
    "nicht entscheiden",
    "richtige move",
  ];

  for (const signal of decisionSignals) {
    if (normalizedInput.includes(signal)) {
      score += 2;
    }
  }

  const extractedOptions = extractOptionsFromQuestion(userInput);
  if (extractedOptions.length >= 2) {
    score += 3;
  }

  const highStakeWords = [
    "wichtig",
    "teuer",
    "riskant",
    "kritisch",
    "große entscheidung",
    "business",
    "kunden",
    "umsatz",
    "job",
    "kündigen",
    "pivot",
    "launch",
  ];

  for (const word of highStakeWords) {
    if (normalizedInput.includes(word)) {
      score += 1;
    }
  }

  // Kontext darf minimal helfen, aber NICHT dominieren.
  if (
    normalizedContext.includes("tradeoff") ||
    normalizedContext.includes("kritische entscheidungen") ||
    normalizedContext.includes("unsicherheit")
  ) {
    score += 0.5;
  }

  const factualSignals = [
    "was ist",
    "wie funktioniert",
    "erkläre",
    "definiere",
    "was bedeutet",
    "wann war",
    "wer ist",
    "fass zusammen",
    "fasse zusammen",
    "unterschied zwischen",
    "vergleich",
    "vergleiche",
  ];

  for (const signal of factualSignals) {
    if (normalizedInput.startsWith(signal)) {
      score -= 5;
    }
  }

  return score >= 4;
}

export function frameCouncilQuestion(input: CouncilInput): string {
  const derivedOptions =
    input.options && input.options.length > 0
      ? uniqueNonEmpty(input.options)
      : extractOptionsFromQuestion(input.userQuestion);

  const derivedConstraints =
    input.constraints && input.constraints.length > 0
      ? uniqueNonEmpty(input.constraints)
      : inferConstraints(input.userQuestion, input.context ?? []);

  const stakes = input.stakes?.trim() || guessStakes(input.userQuestion, input.context ?? []);

  const blocks = [
    `Kernentscheidung: ${input.userQuestion.trim()}`,
    formatList("Kontext", input.context),
    formatList("Optionen", derivedOptions),
    formatList("Constraints", derivedConstraints),
    `Was steht auf dem Spiel: ${stakes}`,
  ];

  return blocks.join("\n");
}

export function buildRolePrompt(role: CouncilRole, framedQuestion: string): string {
  return [
    ROLE_INSTRUCTIONS[role],
    "",
    "Wichtige Regeln:",
    "- Antworte nur aus deiner Rolle.",
    "- Nicht ausbalancieren.",
    "- Keine Meta-Erklärung.",
    "- 80 bis 140 Wörter.",
    "- Direkt rein in die Analyse.",
    "",
    "Hier ist die eingerahmte Frage:",
    framedQuestion,
  ].join("\n");
}

function buildSynthesisPrompt(
  framedQuestion: string,
  opinions: CouncilOpinion[]
): string {
  const opinionsBlock = opinions
    .map(opinion => `${opinion.title}:\n${opinion.analysis}`)
    .join("\n\n");

  return [
    "Du bist der Vorsitzende eines KI-Rats.",
    "Du bekommst eine eingerahmte Frage und 5 bewusst einseitige Perspektiven.",
    "Deine Aufgabe ist nicht, weich zusammenzufassen, sondern ein klares Urteil zu fällen.",
    "",
    "Erzeuge ausschließlich diese Abschnitte:",
    "1. Worüber sich der Rat einig ist",
    "2. Worüber der Rat streitet",
    "3. Was der Rat fast übersehen hätte",
    "4. Die Empfehlung",
    "5. Der erste Schritt",
    "",
    "Regeln:",
    "- Sei klar und entscheidungsstark.",
    "- Kein 'kommt drauf an' ohne Richtung.",
    "- Wenn eine Minderheitsmeinung stärker ist, darfst du ihr folgen.",
    "- Gib agreement/disagreements/missedThings als kurze Bullet-Listen zurück.",
    "- Gib recommendation und firstStep als prägnante Strings zurück.",
    "",
    "Eingerahmte Frage:",
    framedQuestion,
    "",
    "Perspektiven:",
    opinionsBlock,
    "",
    "Gib deine Antwort in diesem JSON-Format zurück:",
    `{
  "agreement": ["..."],
  "disagreements": ["..."],
  "missedThings": ["..."],
  "recommendation": "...",
  "firstStep": "..."
}`,
  ].join("\n");
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return raw.slice(start, end + 1);
}

async function safeLLMCall(llm: LLMFn, prompt: string): Promise<string> {
  try {
    const result = await llm(prompt);
    return typeof result === "string" ? result.trim() : "";
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter LLM-Fehler";

    console.error("\n[safeLLMCall] LLM-Fehler erkannt:");
    console.error(message);
    console.error("[safeLLMCall] Prompt-Vorschau:");
    console.error(prompt.slice(0, 300));
    console.error("-----");

    return `FEHLER: ${message}`;
  }
}

function isUsefulText(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("FEHLER:")) return false;
  return trimmed.length >= 20;
}

export function validateCouncilResult(result: CouncilResult): CouncilResult {
  const agreement = uniqueNonEmpty(result.agreement ?? []);
  const disagreements = uniqueNonEmpty(result.disagreements ?? []);
  const missedThings = uniqueNonEmpty(result.missedThings ?? []);

  const opinions = (result.opinions ?? []).map(opinion => ({
    ...opinion,
    analysis: opinion.analysis?.trim() || "Keine belastbare Analyse erzeugt.",
  }));

  return {
    ...result,
    opinions,
    agreement:
      agreement.length > 0
        ? agreement
        : ["Mehrere Perspektiven sehen hier eine echte Entscheidungsfrage."],
    disagreements:
      disagreements.length > 0
        ? disagreements
        : ["Risiko, Timing oder Umsetzbarkeit werden unterschiedlich bewertet."],
    missedThings:
      missedThings.length > 0
        ? missedThings
        : ["Die Qualität der Eingangsfrage beeinflusst die Qualität des Rats stark."],
    recommendation:
      result.recommendation?.trim() ||
      "Folge der stärksten Begründung statt der bequemsten Standardantwort.",
    firstStep:
      result.firstStep?.trim() ||
      "Formuliere die Kernentscheidung in einem Satz und benenne die echten Optionen klar.",
  };
}

function computeConfidence(params: {
  opinions: CouncilOpinion[];
  agreement: string[];
  disagreements: string[];
  missedThings: string[];
  recommendation: string;
  firstStep: string;
  extractedOptions: string[];
  usedFallbacks: number;
}): number {
  let score = 0.45;

  const usefulOpinions = params.opinions.filter(o => isUsefulText(o.analysis)).length;
  score += Math.min(usefulOpinions * 0.06, 0.30);

  if (params.agreement.length > 0) score += 0.05;
  if (params.disagreements.length > 0) score += 0.03;
  if (params.missedThings.length > 0) score += 0.03;
  if (params.recommendation.trim().length > 20) score += 0.04;
  if (params.firstStep.trim().length > 10) score += 0.04;
  if (params.extractedOptions.length >= 2) score += 0.04;

  score -= Math.min(params.usedFallbacks * 0.07, 0.21);

  const clamped = Math.max(0.1, Math.min(0.98, score));
  return Number(clamped.toFixed(2));
}

export async function runCouncil(
  input: CouncilInput,
  llm: LLMFn
): Promise<CouncilResult> {
  const extractedOptions =
    input.options && input.options.length > 0
      ? uniqueNonEmpty(input.options)
      : extractOptionsFromQuestion(input.userQuestion);

  const framedQuestion = frameCouncilQuestion({
    ...input,
    options: extractedOptions.length > 0 ? extractedOptions : input.options,
  });

  const roles: CouncilRole[] = [
    "skeptiker",
    "grundsatz_denker",
    "visionaer",
    "aussenstehender",
    "macher",
  ];

  const opinions: CouncilOpinion[] = [];
  let usedFallbacks = 0;

  for (const role of roles) {
    const prompt = buildRolePrompt(role, framedQuestion);
    const raw = await safeLLMCall(llm, prompt);

    let analysis = raw;

    if (!isUsefulText(analysis)) {
      analysis = `Keine belastbare Rollen-Antwort erzeugt. Rolle: ${ROLE_TITLES[role]}. Bitte Anfrage oder LLM-Ausgabe prüfen.`;
      usedFallbacks += 1;
    }

    opinions.push({
      role,
      title: ROLE_TITLES[role],
      analysis: analysis.trim(),
    });
  }

  const synthesisPrompt = buildSynthesisPrompt(framedQuestion, opinions);
  const synthesisRaw = await safeLLMCall(llm, synthesisPrompt);

  let parsed = safeJsonParse<{
    agreement?: string[];
    disagreements?: string[];
    missedThings?: string[];
    recommendation?: string;
    firstStep?: string;
  }>(synthesisRaw);

  if (!parsed) {
    const extractedJson = extractJsonObject(synthesisRaw);
    if (extractedJson) {
      parsed = safeJsonParse(extractedJson);
    }
  }

  if (!parsed) {
    usedFallbacks += 1;
  }

  const result: CouncilResult = {
    framedQuestion,
    opinions,
    agreement: parsed?.agreement ?? [
      "Mehrere Perspektiven sehen hier echten Entscheidungsbedarf statt einer bloßen Detailfrage.",
    ],
    disagreements: parsed?.disagreements ?? [
      "Risiko, Timing oder Umsetzbarkeit werden nicht von allen gleich bewertet.",
    ],
    missedThings: parsed?.missedThings ?? [
      "Die Qualität des Inputs an den Rat beeinflusst die Qualität der Empfehlung stark.",
    ],
    recommendation:
      parsed?.recommendation ??
      "Nutze den Rat gezielt für echte Tradeoff-Entscheidungen statt als Dauer-Default.",
    firstStep:
      parsed?.firstStep ??
      "Formuliere die Entscheidung in einem Satz und nenne die realen Optionen explizit.",
    extractedOptions,
  };

  const validated = validateCouncilResult(result);

  validated.confidence = computeConfidence({
    opinions: validated.opinions,
    agreement: validated.agreement,
    disagreements: validated.disagreements,
    missedThings: validated.missedThings,
    recommendation: validated.recommendation,
    firstStep: validated.firstStep,
    extractedOptions,
    usedFallbacks,
  });

  return validated;
}

export function renderCouncilMarkdown(result: CouncilResult): string {
  const opinionsMarkdown = result.opinions
    .map(opinion => `## ${opinion.title}\n${opinion.analysis}`)
    .join("\n\n");

  const agreement = result.agreement.map(item => `- ${item}`).join("\n");
  const disagreements = result.disagreements.map(item => `- ${item}`).join("\n");
  const missedThings = result.missedThings.map(item => `- ${item}`).join("\n");

  const extractedOptionsBlock =
    result.extractedOptions && result.extractedOptions.length > 0
      ? [
          "## Erkannte Optionen",
          result.extractedOptions.map(option => `- ${option}`).join("\n"),
          "",
        ].join("\n")
      : "";

  const confidenceText =
    typeof result.confidence === "number"
      ? `${Math.round(result.confidence * 100)}%`
      : "nicht berechnet";

  return [
    "# Der Rat",
    "",
    "## Eingerahmte Frage",
    result.framedQuestion,
    "",
    extractedOptionsBlock,
    opinionsMarkdown,
    "",
    "## Worüber sich der Rat einig ist",
    agreement,
    "",
    "## Worüber der Rat streitet",
    disagreements,
    "",
    "## Was der Rat fast übersehen hätte",
    missedThings,
    "",
    "## Die Empfehlung",
    result.recommendation,
    "",
    "## Der erste Schritt",
    result.firstStep,
    "",
    "## Konfidenz",
    confidenceText,
  ].join("\n");
}

export async function handleUserMessage(params: {
  userInput: string;
  context?: string[];
  llm: LLMFn;
  directAnswer: LLMFn;
}): Promise<string> {
  const { userInput, context = [], llm, directAnswer } = params;

  if (!shouldInvokeCouncil(userInput, context)) {
    return directAnswer(userInput);
  }

  const councilResult = await runCouncil(
    {
      userQuestion: userInput,
      context,
    },
    llm
  );

  return renderCouncilMarkdown(councilResult);
}
``
