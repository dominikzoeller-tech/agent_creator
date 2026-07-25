# hotfix-self-builder-top-v2

Robuster Fix fuer den sichtbaren Agent-Selbstbau-Block.

Fix gegen Fehler im alten Script:

```text
SyntaxError: missing ) after argument list
```

Dieser Patch:

- legt `/api/cmt/master/secure/self-build/plan` an
- setzt den Block `Agent-Selbstbau TOP` direkt oben auf die Agent-Seite
- fuegt `selftop2:verify` hinzu
- vermeidet verschachtelte Template-Strings im Patch-Script

Ausfuehren:

```powershell
node .\hotfix-self-builder-top-v2\scripts\hotfix-self-builder-top-v2.cjs
npm run selftop2:verify
npm run build
```
