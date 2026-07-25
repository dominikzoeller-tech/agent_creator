#!/bin/bash
# Test Commands für Self-Build-Plan Generator
# ============================================
# 
# Führe diese Befehle aus, um die Implementierung zu testen.
# Jeweils in separaten Terminals.

echo "=== Terminal 1: Start API ==="
npm run api:start

# Warte bis die API lädt (ca. 5-10 Sekunden)

echo ""
echo "=== Terminal 2: Fetch Self-Build Plan ==="
npm run selfbuilder1:plan

echo ""
echo "=== Terminal 3: Verify Plan ==="
npm run selfbuilder1:verify

echo ""
echo "=== Verify Changes in Git ==="
git status --short

echo ""
echo "=== Check Routes ==="
curl http://localhost:7071/health
curl http://localhost:7071/api/cmt/master/secure/self-build/plan
