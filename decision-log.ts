
import { mkdir, appendFile, readFile } from "node:fs/promises";
import path from "node:path";

export interface DecisionLogEntry {
  timestamp: string;
  route: "direct" | "council";
  userInput: string;
  recommendation: string | null;
  firstStep: string | null;
  confidence: number | null;
  context?: string[];
  extractedOptions?: string[];
  suggestedAgents?: string[];
  routingDetails?: unknown;
  routingSummary?: string;
  usedKnowledge?: boolean;
  knowledgeSummary?: string;
  knowledgeHits?: unknown[];
  usedMemory?: boolean;
  memorySummary?: string;
  memoryHits?: unknown[];
  usedWebResearch?: boolean;
  webResearchEnabled?: boolean;
  webResearchQuery?: string;
  webResearchMessage?: string;
  webResearchResults?: unknown[];
}

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "decision-log.jsonl");

async function ensureLogDir(): Promise<void> {
  await mkdir(LOG_DIR, { recursive: true });
}

export async function appendDecisionLog(entry: DecisionLogEntry): Promise<void> {
  await ensureLogDir();
  const line = JSON.stringify(entry) + "\n";
  await appendFile(LOG_FILE, line, "utf8");
}

export async function readDecisionLog(limit = 20): Promise<DecisionLogEntry[]> {
  try {
    const raw = await readFile(LOG_FILE, "utf8");

    const entries = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as DecisionLogEntry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is DecisionLogEntry => entry !== null);

    return entries.slice(-limit).reverse();
  } catch {
    return [];
  }
}
