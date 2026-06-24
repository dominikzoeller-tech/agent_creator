import { classifyIntent, shouldInvokeCouncil } from "./council-engine";

export type DataSensitivity = "public" | "internal" | "confidential" | "restricted";
export type ProcessingMode = "auto" | "local_only" | "hybrid" | "cloud_allowed";
export type ProcessingPath = "cloud_raw" | "cloud_redacted" | "local_policy";

interface ProcessingDecisionInput {
  sensitivity: DataSensitivity;
  processingMode: ProcessingMode;
  allowCloudForSensitive: boolean;
}

export function determineProcessingPath(input: ProcessingDecisionInput): ProcessingPath {
  const { sensitivity, processingMode, allowCloudForSensitive } = input;

  if (processingMode === "local_only") {
    return "local_policy";
  }

  if (sensitivity === "public" || sensitivity === "internal") {
    return "cloud_raw";
  }

  if (sensitivity === "confidential") {
    if (processingMode === "cloud_allowed" && allowCloudForSensitive) {
      return "cloud_raw";
    }

    if (processingMode === "hybrid" || processingMode === "auto") {
      return "cloud_redacted";
    }

    return "local_policy";
  }

  // restricted
  if (processingMode === "cloud_allowed" && allowCloudForSensitive) {
    return "cloud_redacted";
  }

  return "local_policy";
}

export function redactSensitiveText(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(/\bsk-[A-Za-z0-9_-]{10,}\b/g, "[REDACTED_API_KEY]")
    .replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g, "[REDACTED_IBAN_OR_ID]")
    .replace(/\b\d{12,}\b/g, "[REDACTED_LONG_NUMBER]")
    .replace(/\b\d{2,4}[-/.]\d{2,4}[-/.]\d{2,4}\b/g, "[REDACTED_DATE_OR_ID]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[REDACTED_UUID]");
}

export function redactContext(items: string[]): string[] {
  return items.map((item) => redactSensitiveText(item));
}

export function classifyLocalRouteSuggestion(userInput: string, context: string[] = []): "direct" | "council" {
  if (shouldInvokeCouncil(userInput, context)) {
    return "council";
  }

  const intent = classifyIntent(userInput);
  return intent === "decision" ? "council" : "direct";
}
