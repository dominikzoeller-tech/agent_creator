# Phase 6.8a – Server Log Deep Inspector

## Zweck

Der erste Phase-6.8-Inspector hat gezeigt:

- `decision-log.ts` braucht neue Felder.
- `frontend/app/api/analytics/route.ts` braucht Agent-Auswertung.
- `frontend/lib/types.ts` ist bereits teilweise vorbereitet.
- `server.ts` wurde vom ersten Inspector nicht ausreichend erkannt.

Damit der echte Logging-Patch nicht blind passiert, gibt dieses Paket einen tieferen `server.ts`-Inspector aus.

## Dateien

```text
scripts/phase6-8a-inspect-server-log-flow.cjs
scripts/add-phase6-8a-server-inspect-script.cjs
phase6-8a-server-log-deep-inspector.md
```

## Anwendung

```powershell
node scripts/add-phase6-8a-server-inspect-script.cjs
npm run phase6:server:inspect
```

## Danach

Die Ausgabe in den Chat kopieren. Danach kann der echte Patch für `server.ts`, `decision-log.ts` und Analytics gezielt erstellt werden.
