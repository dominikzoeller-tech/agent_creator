# mvp-agent-24

Grosser Sprint-Patch: `.env`/Git-Ignore-Preflight vorbereiten, weiterhin ohne echte Secrets.

Ziel: Der Secure Master Agent zeigt lokal, welche Dateien und Regeln fuer Secret-Sicherheit vor Live-KI geprueft werden muessen.

Enthaelt:

1. Env/Git-Ignore-Preflight-Modul
2. sichtbarer Preflight-Block auf `/cmt/master/secure/agent`
3. Checkliste fuer `.env.local`, `.gitignore`, Secret-Leaks und API-Key-Schutz
4. klare Anzeige: echte API-Keys weiter verboten
5. Export enthaelt `envPreflight`
6. kein echter Provider-Call
7. keine neuen Status-/Entry-/Handoff-Seiten

Weiterhin sicher:

- secretInputAllowed = false
- browserSecretStorageAllowed = false
- repoSecretStorageAllowed = false
- providerCallAllowed = false
- liveModelEnabled = false
