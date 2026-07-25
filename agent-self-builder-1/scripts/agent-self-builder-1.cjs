#!/usr/bin/env node
/**
 * agent-self-builder-1.cjs - COMPLETE REWRITE
 * 
 * Fetches Self-Build-Plan from API and saves locally.
 * No .env secrets, no automatic file changes.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");

const PLAN_API_URL = "http://localhost:7071/api/cmt/master/secure/self-build/plan";
const OUTPUT_DIR = path.join(__dirname, "..", "output");
const PLAN_FILE = path.join(OUTPUT_DIR, `self-build-plan-${Date.now()}.json`);

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory created: ${OUTPUT_DIR}`);
  }
}

function formatPlan(plan) {
  const lines = [];

  lines.push("\n╔═══════════════════════════════════════════════════════════╗");
  lines.push("║        SECURE MASTER AGENT - SELF-BUILD PLAN              ║");
  lines.push("╚═══════════════════════════════════════════════════════════╝\n");

  lines.push(`📋 Plan ID: ${plan.planId}`);
  lines.push(`📅 Timestamp: ${plan.timestamp}`);
  lines.push(`🔖 Version: ${plan.agentVersion}\n`);

  lines.push(`📌 Title: ${plan.title}`);
  lines.push(`📝 Summary: ${plan.summary}\n`);

  lines.push(`📊 Metrics:`);
  lines.push(`   Changes: ${plan.totalChanges}`);
  lines.push(`   Estimated Days: ${plan.estimatedDays}\n`);

  lines.push("─ Changes ─────────────────────────────────────────────────");
  for (const change of plan.changes) {
    const priorityEmoji = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🟢",
    }[change.priority] || "?";

    const difficultyEmoji = {
      easy: "✅",
      medium: "⚠️",
      hard: "🔧",
    }[change.difficulty] || "?";

    lines.push(
      `\n${priorityEmoji} [${difficultyEmoji}] ${change.fileOrComponent}`
    );
    lines.push(`   Change: ${change.change}`);
    lines.push(`   Reason: ${change.reason}`);
  }

  lines.push("\n─ Quick Commands ──────────────────────────────────────────");
  for (const cmd of plan.commands) {
    lines.push(`\n  $ ${cmd.command}`);
    lines.push(`    ${cmd.description}`);
  }

  lines.push("\n─ Next Steps ──────────────────────────────────────────────");
  lines.push("\n  1. Review the plan above");
  lines.push(`  2. npm run selfbuilder1:verify`);
  lines.push(`  3. Read the Copilot prompts for each change`);
  lines.push(`  4. Apply changes manually via Copilot or manually edit`);
  lines.push(`  5. npm run build`);
  lines.push(`  6. git add . && git commit -m "..."`);

  lines.push("\n═════════════════════════════════════════════════════════════\n");

  return lines.join("\n");
}

function fetchPlan() {
  return new Promise((resolve, reject) => {
    http
      .get(PLAN_API_URL, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            reject(new Error(`Failed to parse API response: ${e.message}`));
          }
        });
      })
      .on("error", (err) => {
        reject(
          new Error(
            `Failed to fetch from ${PLAN_API_URL}: ${err.message}\n\n` +
              "💡 Hint: Is the API running? Try: npm run api:start"
          )
        );
      });
  });
}

async function main() {
  console.log("🚀 Agent Self-Build Plan Generator\n");

  ensureOutputDir();

  try {
    console.log(`📡 Fetching plan from ${PLAN_API_URL}...`);
    const plan = await fetchPlan();

    console.log("✅ Plan received\n");

    const formatted = formatPlan(plan);
    console.log(formatted);

    fs.writeFileSync(PLAN_FILE, JSON.stringify(plan, null, 2));
    console.log(`💾 Plan saved to: ${PLAN_FILE}\n`);

    console.log("📋 Next steps:");
    console.log(`   1. Review the plan above`);
    console.log(`   2. npm run selfbuilder1:verify`);
    console.log(`   3. Apply changes using Copilot prompts`);
    console.log(`   4. npm run build`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();

