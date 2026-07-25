#!/usr/bin/env node
/**
 * verify.cjs
 *
 * Validates Self-Build-Plan before applying changes.
 * Checks: files exist, no git conflicts, plan structure OK
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OUTPUT_DIR = path.join(__dirname, "..", "output");
const REPO_ROOT = path.join(__dirname, "..", "..");

function getLatestPlanFile() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    return null;
  }

  const files = fs.readdirSync(OUTPUT_DIR);
  const planFiles = files.filter((f) => f.startsWith("self-build-plan-"));

  if (planFiles.length === 0) {
    return null;
  }

  const sorted = planFiles.sort().reverse();
  return path.join(OUTPUT_DIR, sorted[0]);
}

function loadPlan(planFile) {
  try {
    const content = fs.readFileSync(planFile, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`Failed to load plan: ${e.message}`);
  }
}

function checkGitStatus() {
  try {
    const status = execSync("git status --short", { cwd: REPO_ROOT, encoding: "utf-8" });
    const lines = status.trim().split("\n").filter((l) => l.length > 0);
    return {
      dirty: lines.length > 0,
      files: lines,
    };
  } catch (e) {
    return { dirty: false, files: [] };
  }
}

function checkFileExists(filePath) {
  const fullPath = path.join(REPO_ROOT, filePath);
  return fs.existsSync(fullPath);
}

function main() {
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║           SELF-BUILD PLAN VERIFICATION                    ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  const planFile = getLatestPlanFile();

  if (!planFile) {
    console.error("❌ No plan file found. Run: npm run selfbuilder1:plan");
    process.exit(1);
  }

  console.log(`📋 Plan file: ${path.basename(planFile)}\n`);

  let plan;
  try {
    plan = loadPlan(planFile);
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }

  console.log(`Plan ID: ${plan.planId}`);
  console.log(`Changes: ${plan.totalChanges}\n`);

  let allOk = true;

  console.log("─ Checking Files ──────────────────────────────────────────");
  for (const change of plan.changes) {
    const filePath = change.fileOrComponent;

    // Skip for new files or components
    if (filePath.includes("Neues") || filePath.includes("Script") || filePath.includes("new")) {
      console.log(`✅ ${filePath} (new file - will be created)`);
      continue;
    }

    const exists = checkFileExists(filePath);
    if (exists) {
      console.log(`✅ ${filePath}`);
    } else {
      console.log(`⚠️  ${filePath} (file not found - will be created)`);
    }
  }

  console.log("\n─ Checking Git Status ────────────────────────────────────");
  const gitStatus = checkGitStatus();
  if (gitStatus.dirty) {
    console.log("⚠️  Working directory is dirty:");
    for (const file of gitStatus.files) {
      console.log(`   ${file}`);
    }
    console.log("\n💡 Hint: Commit changes before applying plan");
    allOk = false;
  } else {
    console.log("✅ Git working directory is clean");
  }

  console.log("\n─ Checking Plan Structure ────────────────────────────────");
  if (plan.planId && plan.timestamp && plan.changes && plan.commands) {
    console.log("✅ Plan structure is valid");
  } else {
    console.log("❌ Plan structure is invalid");
    allOk = false;
  }

  console.log("\n─ Summary ─────────────────────────────────────────────────");

  if (allOk && !gitStatus.dirty) {
    console.log(
      "\n✅ Plan is ready to apply!\n" +
        "   Next: Review changes and apply manually via Copilot\n" +
        "   Then: npm run build && git add . && git commit ...\n"
    );
    process.exit(0);
  } else {
    console.log(
      "\n⚠️  Plan verification found issues.\n" +
        "   Fix issues above and try again.\n" +
        "   Or review plan: npm run selfbuilder1:plan\n"
    );
    process.exit(1);
  }
}

main();
