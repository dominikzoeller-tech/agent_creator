# mvp-agent-19

Groesserer Sprint-Patch: Arbeitsansicht verdichten und klare Schwelle anzeigen.

Ziel: Die Hauptseite wird nicht weiter aufgeblasen, sondern bekommt eine kompakte Top-Zusammenfassung mit klarer Aussage:

- Jetzt lokal arbeiten
- Noch nicht live
- Naechste Schwelle: Provider-Adapter deaktiviert vorbereiten

Enthaelt:

1. Work-State-Modul
2. kompakte Top-Leiste direkt auf `/cmt/master/secure/agent`
3. klare Statuswerte fuer `localWorkReady`, `liveReady`, `providerAdapterNext`
4. klare Nutzeranweisung: welche Seite nutzen und was testen
5. Export enthaelt `workState`
6. kein echter Provider-Call
7. keine neuen Status-/Entry-/Handoff-Seiten

Weiterhin sicher:

- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
- providerCallAllowed = false
- dryRunOnly = true
