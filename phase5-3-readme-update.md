# Phase 5.3 – README sauber aktualisieren

## Ziel

Die Haupt-README soll den aktuellen Projektstand dokumentieren:

- Start ohne Docker
- Start mit Docker
- wichtige URLs
- Stack-Kommandos
- UI-Bereiche
- Privacy-First-Verarbeitung
- typische Probleme

---

## Dateien

```text
README-phase5-3-section.md
scripts/update-readme-phase5-3.cjs
phase5-3-readme-update.md
```

---

## Anwendung

Im Projekt-Root ausführen:

```powershell
node scripts/update-readme-phase5-3.cjs
```

Danach prüfen:

```powershell
git diff README.md
```

Wenn alles passt:

```powershell
git add README.md README-phase5-3-section.md scripts/update-readme-phase5-3.cjs phase5-3-readme-update.md
git commit -m "docs: update README for internal docker deployment"
git push origin main
```
