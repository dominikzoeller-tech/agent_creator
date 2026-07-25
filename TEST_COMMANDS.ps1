# Test Commands für Self-Build-Plan Generator (PowerShell)
# ==========================================================
# Führe diese Befehle aus, um die Implementierung zu testen

Write-Host "=== Test 1: Überprüfe TypeScript Kompilation ===" -ForegroundColor Green
npx tsc --noEmit --project tsconfig.json
if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ TypeScript kompiliert erfolgreich" -ForegroundColor Green
} else {
  Write-Host "❌ TypeScript-Fehler gefunden" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "=== Test 2: Überprüfe ob neue Dateien existieren ===" -ForegroundColor Green
$files = @(
  "agent-self-build-plan.ts",
  "agent-self-builder-1\scripts\agent-self-builder-1.cjs",
  "agent-self-builder-1\scripts\verify.cjs"
)
foreach ($file in $files) {
  $path = "C:\Users\User\ai-assistant\agent_creator\$file"
  if (Test-Path $path) {
    Write-Host "✅ $file existiert" -ForegroundColor Green
  } else {
    Write-Host "❌ $file nicht gefunden" -ForegroundColor Red
    exit 1
  }
}

Write-Host ""
Write-Host "=== Test 3: Überprüfe package.json Scripts ===" -ForegroundColor Green
$pkg = Get-Content package.json | ConvertFrom-Json
$scripts = @("selfbuilder1:plan", "selfbuilder1:verify", "agent:selfbuild:plan")
foreach ($script in $scripts) {
  if ($pkg.scripts.$script) {
    Write-Host "✅ Script '$script' existiert" -ForegroundColor Green
  } else {
    Write-Host "❌ Script '$script' nicht gefunden" -ForegroundColor Red
    exit 1
  }
}

Write-Host ""
Write-Host "=== Test 4: Überprüfe server.ts Route ===" -ForegroundColor Green
$content = Get-Content server.ts -Raw
if ($content -match '/api/cmt/master/secure/self-build/plan') {
  Write-Host "✅ Route in server.ts gefunden" -ForegroundColor Green
} else {
  Write-Host "❌ Route in server.ts nicht gefunden" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "=== Test 5: Überprüfe Import in server.ts ===" -ForegroundColor Green
if ($content -match 'generateSelfBuildPlan') {
  Write-Host "✅ generateSelfBuildPlan Import gefunden" -ForegroundColor Green
} else {
  Write-Host "❌ generateSelfBuildPlan Import nicht gefunden" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "=== Alle Tests bestanden! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor Cyan
Write-Host "  1. Terminal 1: npm run api:start"
Write-Host "  2. Terminal 2: npm run selfbuilder1:plan"
Write-Host "  3. Terminal 3: npm run selfbuilder1:verify"
Write-Host ""
