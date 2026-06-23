
import OpenAI from "openai";
import "dotenv/config";
import type { LLMFn } from "./council-engine";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Umgebungsvariable fehlt: ${name}`);
  }
  return value;
}

function getClientAndModel() {
  const apiKey = requireEnv("OPENAI_API_KEY");
  const model = requireEnv("OPENAI_MODEL");

  const client = new OpenAI({ apiKey });
  return { client, model };
}

console.log("[real-llm.ts] Datei wurde geladen");

export const realLLM: LLMFn = async (prompt: string) => {
  const { client, model } = getClientAndModel();

  console.log("\n[realLLM] Starte Request");
  console.log("[realLLM] Modell:", model);
  console.log("[realLLM] Prompt-Vorschau:");
  console.log(prompt.slice(0, 300));
  console.log("-----");

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Du bist ein präziser deutschsprachiger KI-Assistent. Antworte klar, direkt und ohne unnötiges Meta-Gerede. Wenn JSON verlangt wird, liefere nur valides JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const choice = completion.choices[0];
    const text = choice?.message?.content;

    console.log("[realLLM] finish_reason:", choice?.finish_reason ?? "unbekannt");
    console.log("[realLLM] Rohantwort-Typ:", typeof text);
    console.log("[realLLM] Rohantwort-Vorschau:");
    console.log(String(text).slice(0, 400));
    console.log("-----");

    if (typeof text !== "string" || !text.trim()) {
      throw new Error("Leere Modellantwort erhalten.");
    }

    return text.trim();
  } catch (error) {
    console.error("\n[realLLM] FEHLER:");
    console.error(error);
    throw error;
  }
};
