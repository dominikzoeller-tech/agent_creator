# mvp-agent-hotfix-32c

Sammel-Hotfix fuer fehlende Imports/Konstanten auf `/cmt/master/secure/agent`.

Aktueller Fehler:

`secureMasterSecretReadiness is not defined`

Dieser Hotfix sichert mehrere noch fehlende Readiness-/Config-Imports ab, damit nicht wieder direkt der naechste `XYZ is not defined` Fehler kommt.

Ausfuehren:

```powershell
node .\mvp-agent-hotfix-32c\scripts\mvp-agent-hotfix-32c.cjs
npm run hotfix32c:verify
npm run build
```
