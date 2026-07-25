# mvp-agent-6

Ziel: Provider-Konfiguration sichtbar vorbereiten, aber Live-KI weiterhin deaktiviert lassen.

Keine neuen Status-/Entry-/Handoff-Seiten.

Verbesserungen auf `/cmt/master/secure/agent`:

- Provider-Konfiguration als lokaler, blockierter Status sichtbar
- unterstützte Provider-Platzhalter sichtbar
- benötigte ENV-Keys sichtbar
- Live-Aktivierung bleibt ausdrücklich gesperrt
- nächster Schritt Richtung Live-Modell wird klarer

Weiterhin sicher:

- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
