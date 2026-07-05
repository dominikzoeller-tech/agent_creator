import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

export type KnowledgeIssueSeverity = "info" | "warning" | "error";

export interface KnowledgeQualityIssue {
  code: string;
  severity: KnowledgeIssueSeverity;
  message: string;
}

export interface KnowledgeQualityFileReport {
  fileName: string;
  title: string;
  tags: string[];
  size: number;
  updatedAt: string;
  wordCount: number;
  lineCount: number;
  issues: KnowledgeQualityIssue[];
}

export interface KnowledgeQualityReport {
  ok: true;
  knowledgeDir: string;
  totalFiles: number;
  filesWithIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  duplicateTitleGroups: string[][];
  duplicateContentGroups: string[][];
  files: KnowledgeQualityFileReport[];
}

const SUPPORTED_EXTENSIONS = new Set([".md", ".txt"]);

export async function buildKnowledgeQualityReport(
  knowledgeDir = process.env.KNOWLEDGE_DIR || path.join(process.cwd(), "knowledge")
): Promise<KnowledgeQualityReport> {
  const files = await loadKnowledgeFiles(knowledgeDir);
  const duplicateTitleGroups = findDuplicateGroups(files, (file) => normalizeText(file.title));
  const duplicateContentGroups = findDuplicateGroups(files, (file) => normalizeText(file.content).slice(0, 800));

  const duplicateTitleNames = new Set(duplicateTitleGroups.flat());
  const duplicateContentNames = new Set(duplicateContentGroups.flat());

  const reports = files.map((file) => {
    const issues = evaluateFile(file, duplicateTitleNames, duplicateContentNames);
    return {
      fileName: file.fileName,
      title: file.title,
      tags: file.tags,
      size: file.size,
      updatedAt: file.updatedAt,
      wordCount: file.wordCount,
      lineCount: file.lineCount,
      issues,
    } satisfies KnowledgeQualityFileReport;
  });

  return {
    ok: true,
    knowledgeDir,
    totalFiles: reports.length,
    filesWithIssues: reports.filter((file) => file.issues.length > 0).length,
    errorCount: countSeverity(reports, "error"),
    warningCount: countSeverity(reports, "warning"),
    infoCount: countSeverity(reports, "info"),
    duplicateTitleGroups,
    duplicateContentGroups,
    files: reports.sort((a, b) => b.issues.length - a.issues.length || a.fileName.localeCompare(b.fileName)),
  };
}

interface LoadedKnowledgeFile {
  fileName: string;
  title: string;
  tags: string[];
  content: string;
  size: number;
  updatedAt: string;
  wordCount: number;
  lineCount: number;
}

async function loadKnowledgeFiles(knowledgeDir: string): Promise<LoadedKnowledgeFile[]> {
  const entries = await readdir(knowledgeDir, { withFileTypes: true });
  const files: LoadedKnowledgeFile[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) continue;

    const fullPath = path.join(knowledgeDir, entry.name);
    const [metadata, content] = await Promise.all([
      stat(fullPath),
      readFile(fullPath, "utf8"),
    ]);

    files.push({
      fileName: entry.name,
      title: parseTitle(content, entry.name),
      tags: parseTags(content),
      content,
      size: metadata.size,
      updatedAt: metadata.mtime.toISOString(),
      wordCount: countWords(content),
      lineCount: content.split(/\r?\n/).length,
    });
  }

  return files;
}

function evaluateFile(
  file: LoadedKnowledgeFile,
  duplicateTitleNames: Set<string>,
  duplicateContentNames: Set<string>
): KnowledgeQualityIssue[] {
  const issues: KnowledgeQualityIssue[] = [];
  const trimmed = file.content.trim();

  if (!trimmed) {
    issues.push({ code: "empty-file", severity: "error", message: "Datei ist leer." });
  }

  if (!trimmed.startsWith("# ")) {
    issues.push({ code: "missing-title", severity: "warning", message: "Datei hat keine Markdown-H1-Ãœberschrift." });
  }

  if (file.tags.length === 0) {
    issues.push({ code: "missing-tags", severity: "warning", message: "Datei hat keine Tags-Zeile." });
  }

  if (file.wordCount > 0 && file.wordCount < 25) {
    issues.push({ code: "very-short", severity: "info", message: "Datei ist sehr kurz und liefert eventuell wenig Kontext." });
  }

  if (file.wordCount > 2500) {
    issues.push({ code: "very-long", severity: "info", message: "Datei ist sehr lang. Aufteilen kÃ¶nnte die TrefferqualitÃ¤t verbessern." });
  }

  if (duplicateTitleNames.has(file.fileName)) {
    issues.push({ code: "duplicate-title", severity: "warning", message: "Titel kommt in mehreren Knowledge-Dateien vor." });
  }

  if (duplicateContentNames.has(file.fileName)) {
    issues.push({ code: "duplicate-content", severity: "warning", message: "Inhalt wirkt sehr Ã¤hnlich zu einer anderen Knowledge-Datei." });
  }

  return issues;
}

function parseTitle(content: string, fileName: string): string {
  return content
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith("# "))
    ?.replace(/^#\s+/, "")
    .trim() || fileName;
}

function parseTags(content: string): string[] {
  const tagsLine = content
    .split(/\r?\n/)
    .find((line) => line.trim().toLowerCase().startsWith("tags:"));

  if (!tagsLine) return [];

  return tagsLine
    .replace(/^tags:/i, "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function countWords(content: string): number {
  return content
    .replace(/[#*`>\-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean).length;
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function findDuplicateGroups(files: LoadedKnowledgeFile[], keyFn: (file: LoadedKnowledgeFile) => string): string[][] {
  const groups = new Map<string, string[]>();

  for (const file of files) {
    const key = keyFn(file);
    if (!key || key.length < 8) continue;
    const current = groups.get(key) ?? [];
    current.push(file.fileName);
    groups.set(key, current);
  }

  return Array.from(groups.values()).filter((group) => group.length >= 2);
}

function countSeverity(files: KnowledgeQualityFileReport[], severity: KnowledgeIssueSeverity): number {
  return files.reduce((sum, file) => sum + file.issues.filter((issue) => issue.severity === severity).length, 0);
}

