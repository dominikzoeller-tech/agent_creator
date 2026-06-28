const BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { response, text, json };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoSecretLeak(value, label) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  const secretPatterns = [
    /sk-proj-[A-Za-z0-9_-]{20,}/,
    /sk-[A-Za-z0-9_-]{20,}/,
    /BING_SEARCH_API_KEY\s*[:=]\s*[^\s\"]+/i,
    /OPENAI_API_KEY\s*[:=]\s*[^\s\"]+/i,
  ];
  for (const pattern of secretPatterns) {
    assert(!pattern.test(text), `Potential secret leak in ${label}`);
  }
}

async function main() {
  console.log("======================================");
  console.log(" Phase 9.8 Web Research Smoke Test");
  console.log("======================================");
  console.log(`Base URL: ${BASE_URL}`);

  const checks = [];

  checks.push(["GET /api/web-research no query", async () => {
    const { response, json, text } = await request("/api/web-research");
    assert(response.ok, `Expected 2xx, got ${response.status}`);
    assert(json && json.ok === true, "Expected ok=true JSON");
    assert(Array.isArray(json.results), "Expected results array");
    assertNoSecretLeak(json, "/api/web-research");
    assertNoSecretLeak(text, "/api/web-research raw");
  }]);

  checks.push(["POST /api/web-research-governance blocks missing target", async () => {
    const { response, json } = await request("/api/web-research-governance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "test", summary: "Dies ist eine bewusst längere Test-Zusammenfassung ohne sensible Daten.", sources: [], saveKnowledge: false, saveMemory: false }),
    });
    assert(response.ok, `Expected 2xx, got ${response.status}`);
    assert(json && json.ok === true, "Expected ok=true governance report");
    assert(json.allowed === false, "Expected governance allowed=false because no target selected");
    assert(json.issues.some((issue) => issue.code === "nothing-selected"), "Expected nothing-selected issue");
    assertNoSecretLeak(json, "/api/web-research-governance");
  }]);

  checks.push(["POST /api/web-research-governance detects duplicate sources", async () => {
    const { response, json } = await request("/api/web-research-governance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "privacy first ai agents",
        summary: "Diese Zusammenfassung ist lang genug, um den Short-Summary-Test nicht unnötig zu triggern. Sie enthält geprüfte öffentliche Informationen.",
        sources: [
          { title: "A", url: "https://example.com/a" },
          { title: "A duplicate", url: "https://example.com/a" },
          { title: "B", url: "https://example.org/b" },
        ],
        saveKnowledge: true,
        saveMemory: false,
      }),
    });
    assert(response.ok, `Expected 2xx, got ${response.status}`);
    assert(json && json.ok === true, "Expected ok=true governance report");
    assert(json.deduplicatedSources.length === 2, "Expected 2 deduplicated sources");
    assert(json.issues.some((issue) => issue.code === "duplicate-sources"), "Expected duplicate-sources info");
    assertNoSecretLeak(json, "/api/web-research-governance duplicate");
  }]);

  checks.push(["GET /api/web-research-settings hides secrets", async () => {
    const { response, json, text } = await request("/api/web-research-settings");
    assert(response.ok, `Expected 2xx, got ${response.status}`);
    assert(json && json.ok === true, "Expected ok=true settings status");
    assert(typeof json.bingSearchConfigured === "boolean", "Expected bingSearchConfigured boolean");
    assert(typeof json.openAiConfigured === "boolean", "Expected openAiConfigured boolean");
    assert(!JSON.stringify(json).includes("BING_SEARCH_API_KEY="), "Settings must not expose BING_SEARCH_API_KEY value");
    assert(!JSON.stringify(json).includes("OPENAI_API_KEY="), "Settings must not expose OPENAI_API_KEY value");
    assertNoSecretLeak(json, "/api/web-research-settings");
    assertNoSecretLeak(text, "/api/web-research-settings raw");
  }]);

  checks.push(["POST /api/web-research-save governance blocks unsafe payload", async () => {
    const { response, json } = await request("/api/web-research-save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "test sk-proj-this-should-be-blocked-1234567890",
        summary: "Diese Summary enthält keine weiteren relevanten Inhalte.",
        results: [],
        sources: [],
        saveKnowledge: true,
        saveMemory: false,
      }),
    });
    assert(response.status >= 400, `Expected blocked 4xx, got ${response.status}`);
    assert(json && json.ok === false, "Expected ok=false blocked response");
    assertNoSecretLeak(json, "/api/web-research-save blocked");
  }]);

  let passed = 0;
  for (const [name, fn] of checks) {
    try {
      await fn();
      passed += 1;
      console.log(`OK   ${name}`);
    } catch (error) {
      console.error(`FAIL ${name}`);
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  console.log(`Smoke OK. ${passed}/${checks.length} checks passed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
