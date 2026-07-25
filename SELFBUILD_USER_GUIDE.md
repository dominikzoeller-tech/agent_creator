# Secure Master Agent - Self-Build Plan Generator
## Practical Workspace for Agent Self-Development

### 🎯 What This Does

The Secure Master Agent can now **generate concrete patch plans** for its own development. Instead of just showing diagnostic dashboards, the agent creates **actionable steps** with:

- ✅ File changes (what to create/modify)
- ✅ Reasons (why each change)
- ✅ Copilot prompts (copy-paste ready)
- ✅ Test commands
- ✅ Commit messages

**No automatic file changes. No secrets. Just guidance.**

---

## 🚀 Quick Start (5 min)

### Terminal 1: Start the API

```powershell
npm run api:start

# Output:
# ======================================
# Privacy-First API läuft auf http://localhost:7071
# Endpunkte:
# - GET  /health
# - POST /v1/ask
# - POST /v1/redact
# - GET  /api/cmt/master/secure/self-build/plan
# ======================================
```

### Terminal 2: Generate Self-Build Plan

```powershell
npm run selfbuilder1:plan

# Output:
# 🚀 Agent Self-Build Plan Generator
# 📁 Output directory created: C:\Users\...\output
# 📡 Fetching plan from http://localhost:7071/...
# ✅ Plan received
#
# [Formatted Plan Display]
#
# 💾 Plan saved to: C:\Users\...\output\self-build-plan-1721925000000.json
```

### Terminal 3: Verify the Plan

```powershell
npm run selfbuilder1:verify

# Output:
# ╔═══════════════════════════════════════════════════════════╗
# ║           SELF-BUILD PLAN VERIFICATION                    ║
# ╚═══════════════════════════════════════════════════════════╝
#
# 📋 Plan file: self-build-plan-1721925000000.json
# Plan ID: sbp-1721925000000-abc123
# Changes: 5
#
# ─ Checking Files ──────────────────────────────────────────
# ✅ agent-self-build-plan.ts (new file - will be created)
# ✅ server.ts
# ✅ package.json
# ...
#
# ─ Checking Git Status ────────────────────────────────────
# ✅ Git working directory is clean
#
# ─ Checking Plan Structure ────────────────────────────────
# ✅ Plan structure is valid
#
# ✅ Plan is ready to apply!
```

---

## 📋 What You Get in a Plan

### 1. File Changes (Organized by Priority)

```
🔴 [🔧] agent-self-build-plan.ts
   Change: Neue Datei: Definiert Struktur von Patch-Plänen
   Reason: Der Agent soll konkrete, actionable Pläne erzeugen können
   
🟠 [⚠️] server.ts
   Change: Neue Route: GET /api/cmt/master/secure/self-build/plan
   Reason: API-Zugang zu Self-Build-Plänen
   
🟡 [✅] package.json
   Change: Neue Scripts: selfbuilder1:plan/verify/apply
   Reason: CLI-Zugriffe für Workspace-Integration
```

### 2. Copilot Prompts (Ready to Copy-Paste)

```
For each change:
"Erstelle eine TypeScript-Datei, die Patch-Pläne für Agent-Selbstentwicklung 
strukturiert. Der Plan soll enthalten: Priority, Dateien, Änderungen, Gründe, 
Copilot-Prompts..."

→ Simply paste into Copilot chat
→ Get implementation directly
→ Run npm run build
→ Done!
```

### 3. Quick Commands

```
$ npm run selfbuilder1:plan
  Ruft API auf und speichert Plan lokal

$ npm run selfbuilder1:verify
  Prüft ob Plan anwendbar ist

$ npm run build
  Kompiliert TypeScript und validiert

$ npm run api:start
  Startet den Server auf Port 7071
```

### 4. Next Steps

```
1. Review the plan above
2. npm run selfbuilder1:verify
3. Read the Copilot prompts for each change
4. Apply changes manually via Copilot or manually edit
5. npm run build
6. git add . && git commit -m "..."
```

---

## 🔍 Plan JSON Structure

The plan is saved as JSON in `agent-self-builder-1/output/`:

```json
{
  "planId": "sbp-1721925000000-abc123",
  "timestamp": "2026-07-25T14:38:37.000Z",
  "agentVersion": "1.1.0-selfbuild",
  "title": "Secure Master Agent - Workspace & Self-Build Foundation",
  "totalChanges": 5,
  "estimatedDays": 2,
  "changes": [
    {
      "priority": "critical",
      "fileOrComponent": "agent-self-build-plan.ts",
      "change": "Neue Datei: Definiert Struktur von Patch-Plänen",
      "reason": "Der Agent soll konkrete, actionable Pläne erzeugen können",
      "difficulty": "easy",
      "copilotPrompt": "Erstelle TypeScript-Datei..."
    },
    // ... mehr changes
  ],
  "commands": [
    {
      "label": "Plan generieren",
      "command": "npm run selfbuilder1:plan",
      "description": "Ruft API auf..."
    },
    // ... mehr commands
  ],
  "commitMessage": "feat(selfbuild): Self-Build-Plan Generator...",
  "notes": [
    "🔐 Keine echten Secrets im Response...",
    // ... mehr notes
  ]
}
```

---

## 🔐 Security

✅ **No Real Secrets**
- Only placeholder tokens in examples
- `.env` is never exposed to client
- All secrets stay server-side

✅ **No Automatic Changes**
- Plans are saved locally
- You review before applying
- Copilot prompts are for manual application

✅ **Local-First**
- Plans stored in `agent-self-builder-1/output/`
- Timestamps prevent overwrites
- Full git history tracking

---

## 📚 Example: How to Apply a Plan

### Option 1: Via Copilot Chat (Recommended)

1. Run `npm run selfbuilder1:plan`
2. Find the Copilot prompt in the output
3. Copy the prompt
4. Paste into Copilot chat → `/copilot`
5. Follow Copilot's output
6. `npm run build`
7. Commit

### Option 2: Manual Review

1. Open the plan JSON: `agent-self-builder-1/output/self-build-plan-*.json`
2. Read each change description
3. For each change:
   - Open the target file
   - Make the change as described
   - Save
4. `npm run build`
5. Commit

### Option 3: Script-Assisted (Coming in Phase 50)

Currently the plan is JSON. Future versions will have:
- Direct apply button (with warnings)
- Patch file generation
- Automated testing

---

## 🛠️ Troubleshooting

### API is not running

```powershell
# Error: Failed to fetch from http://localhost:7071/...

# Solution:
npm run api:start

# Then in another terminal:
npm run selfbuilder1:plan
```

### Plan says files don't exist

```powershell
# Error: ⚠️ ... (file not found - will be created)

# This is OK! It means:
# - Files will be created by the plan
# - Existing files will be modified
# - Verify is green if git is clean
```

### git status is dirty

```powershell
# Error: ⚠️ Working directory is dirty

# Solution - commit your changes first:
git add .
git commit -m "current work"
npm run selfbuilder1:verify
```

---

## 📊 Files Changed

| File | Status | Purpose |
|------|--------|---------|
| `agent-self-build-plan.ts` | NEW | Plan generator logic |
| `server.ts` | MODIFIED | +API route |
| `package.json` | MODIFIED | +3 scripts |
| `agent-self-builder-1/scripts/agent-self-builder-1.cjs` | REWRITTEN | API fetcher |
| `agent-self-builder-1/scripts/verify.cjs` | NEW | Plan validator |

---

## 🚀 Next Phases

- **Phase 50**: UI Section `/cmt/master/secure/agent` for visual plan management
- **Phase 51**: Patch-apply workflow with GUI
- **Phase 52**: Automated test execution after apply
- **Phase 53**: Agent-generated patch ZIP files

---

## 🤝 For Developers

### Generate a new plan

```typescript
// In any code:
import { generateSelfBuildPlan, formatPlanForConsole } from "./agent-self-build-plan";

const plan = generateSelfBuildPlan();
console.log(formatPlanForConsole(plan));
```

### Access via API

```bash
curl http://localhost:7071/api/cmt/master/secure/self-build/plan
# Returns JSON SelfBuildPlan
```

### Run tests

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File TEST_COMMANDS.ps1

# Linux/Mac
bash TEST_COMMANDS.sh
```

---

**Status**: ✅ Ready to use  
**Security**: ✅ No real secrets  
**Tests**: ✅ All passing  
**Next**: Phase 50 - UI Section
