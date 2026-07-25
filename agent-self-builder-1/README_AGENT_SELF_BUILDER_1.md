# agent-self-builder-1

Kurswechsel: Der Agent bekommt einen Selbstbau-/Patch-Plan-Modus.

Ziel:
- Nicht noch mehr Sicherheits-/Gate-Panels.
- Der Agent soll dir konkret sagen, wie er sich selbst weiterbauen soll.
- Er erzeugt einen Patch-Plan mit Dateien, Prioritaet, Anwendungsschritten und Copilot-Prompt.
- Noch keine unkontrollierte automatische Dateiaenderung ohne deine Freigabe.

Neue API Route:

```text
/api/cmt/master/secure/self-build/plan
```

Neue UI-Sektion auf:

```text
/cmt/master/secure/agent
```

Name:

```text
Agent-Selbstbau
```

Ausfuehren:

```powershell
node .\agent-self-builder-1\scripts\agent-self-builder-1.cjs
npm run selfbuilder1:verify
npm run build
```
