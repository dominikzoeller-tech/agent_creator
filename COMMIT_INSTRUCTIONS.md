## COMMIT INSTRUCTIONS

### Git Add & Commit

```powershell
# Alle Dateiänderungen hinzufügen
git add agent-self-build-plan.ts
git add server.ts
git add package.json
git add agent-self-builder-1/scripts/agent-self-builder-1.cjs
git add agent-self-builder-1/scripts/verify.cjs

# Optional: Test-Dateien
git add TEST_COMMANDS.ps1
git add TEST_COMMANDS.sh
git add IMPLEMENTATION_SUMMARY_PHASE49.md

# Commit mit Message
git commit -m "feat(selfbuild): Self-Build-Plan Generator für praktische Agent-Entwicklung

- Implementiere agent-self-build-plan.ts mit strukturierten Patch-Plänen
- Neue API-Route: GET /api/cmt/master/secure/self-build/plan
- Rewrite agent-self-builder-1.cjs: Fetcht Plan von API, speichert lokal
- Neue verify.cjs: Validiert Plans vor Anwendung (Dateien, git status, Struktur)
- Neue npm Scripts: selfbuilder1:plan, selfbuilder1:verify, agent:selfbuild:plan
- Keine echten Secrets im Client oder Repo (nur Placeholder-Token in Beispiele)
- Keine automatischen Dateiänderungen - nur strukturierte Guidance
- Fokus: Workspace-Modus statt Diagnose-Dashboard

Patch-Plan enthält:
- Priority + Difficulty für jede Änderung
- Copilot-Prompts für einfache copy-paste Anwendung
- Testbefehle und Commit-Message-Vorschlag
- Lokale Speicherung mit Timestamp

Quick Start:
  Terminal 1: npm run api:start
  Terminal 2: npm run selfbuilder1:plan
  Terminal 3: npm run selfbuilder1:verify

Nächste Phase: UI-Sektion /cmt/master/secure/agent implementieren"
```

### Verify Before Commit

```powershell
# Check Git Status
git status --short

# Check what will be committed
git diff --cached

# Check file count
git status | Select-String "changed|created|modified"
```

### Push (wenn Repo Setup vorhanden)

```powershell
git push origin main
# oder: git push origin develop
```

## POST-COMMIT VERIFICATION

```powershell
# Überprüfe ob commit erfolgreich war
git log -1 --oneline

# Zeige letzten Commit
git show --stat

# Überprüfe ob alle Dateien included sind
git ls-tree -r HEAD | grep agent-self-build
```
