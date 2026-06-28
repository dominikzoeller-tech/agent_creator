const BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { response, json, text };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoSecretLeak(value, label) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  const secretPatterns = [
    /sk-proj-[A-Za-z0-9_-]{20,}/,
    /sk-[A-Za-z0-9_-]{20,}/,
    /OPENAI_API_KEY\s*[:=]\s*[^\s\"]+/i,
    /BING_SEARCH_API_KEY\s*[:=]\s*[^\s\"]+/i,
  ];
  for (const pattern of secretPatterns) {
    assert(!pattern.test(text), `Potential secret leak in ${label}`);
  }
}

async function main() {
  console.log("======================================");
  console.log(" Phase 10 Tool Governance Smoke Test");
  console.log("======================================");
  console.log(`Base URL: ${BASE_URL}`);

  const checks = [];

  checks.push(["GET /api/tools", async () => {
    const { response, json } = await request("/api/tools");
    assert(response.ok, `Expected 2xx, got ${response.status}`);
    assert(json?.ok === true, "Expected ok=true");
    assert(Array.isArray(json.tools), "Expected tools array");
    assert(json.tools.some((tool) => tool.id === "web-research"), "Expected web-research tool");
    assertNoSecretLeak(json, "/api/tools");
  }]);

  checks.push(["GET /api/tool-permissions internal auto", async () => {
    const { response, json } = await request("/api/tool-permissions?sensitivity=internal&processingMode=auto");
    assert(response.ok, `Expected 2xx, got ${response.status}`);
    assert(json?.ok === true, "Expected ok=true");
    assert(Array.isArray(json.decisions), "Expected decisions array");
    assert(json.decisions.some((decision) => decision.toolId === "web-research" && decision.allowed === false), "Expected web-research blocked for internal");
    assertNoSecretLeak(json, "/api/tool-permissions");
  }]);

  checks.push(["POST /api/tool-preflight blocks sensitive external input", async () => {
    const { response, json } = await request("/api/tool-preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toolId: "web-research",
        sensitivity: "public",
        processingMode: "auto",
        userInput: "Bitte recherchiere sk-test-secret-12345678901234567890",
      }),
    });
    assert(response.ok, `Expected 2xx, got ${response.status}`);
    assert(json?.ok === true, "Expected ok=true");
    assert(json.allowed === false, "Expected allowed=false for sensitive input");
    assert(json.reasons.some((reason) => reason.includes("sensible Daten")), "Expected sensitive data reason");
    assertNoSecretLeak(json, "/api/tool-preflight");
  }]);

  checks.push(["GET /api/analytics includes governance fields", async () => {
    const { response, json } = await request("/api/analytics");
    assert(response.ok, `Expected 2xx, got ${response.status}`);
    assert(json?.ok === true, "Expected ok=true");
    assert("toolPreflightEntriesCount" in json, "Expected toolPreflightEntriesCount");
    assert("toolEnforcementEntriesCount" in json, "Expected toolEnforcementEntriesCount");
    assertNoSecretLeak(json, "/api/analytics");
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
