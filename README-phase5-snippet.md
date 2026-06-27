## Internes Docker-Deployment

Der interne Stack startet die Privacy-First API und das Frontend gemeinsam über Docker Compose.

### Start im Hintergrund

```powershell
npm run stack:up:detached
```

### Health prüfen

```powershell
npm run stack:health
```

### Browser-URLs

```text
http://localhost:3000
http://localhost:3000/logs
http://localhost:3000/analytics
http://localhost:3000/system
http://localhost:7071/health
```

### Logs anzeigen

```powershell
npm run stack:logs
```

### Stoppen

```powershell
npm run stack:down
```

### Hinweise

- `.env` bleibt lokal und wird nicht committed.
- `.env.example` dient nur als Vorlage.
- `restricted` wird weiterhin lokal über Policy behandelt.
- `confidential` wird vor Cloud-Verarbeitung redigiert.
