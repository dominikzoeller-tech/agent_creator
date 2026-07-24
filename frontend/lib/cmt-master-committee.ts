import { askSecureMasterQuality, type SecureMasterQualityResult } from './cmt-master-quality';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type CommitteeRoleId = 'visionary' | 'skeptic' | 'operator' | 'privacy_risk' | 'business_value';

export type CommitteeRoleAnswer = {
  id: CommitteeRoleId;
  name: string;
  focus: string;
  answer: string;
};

export type SecureMasterCommitteeResult = SecureMasterQualityResult & {
  phaseCommittee: '125.0';
  committeeLabel: 'Secure Master Committee Integration';
  committeeTriggered: boolean;
  committeeRoles: CommitteeRoleAnswer[];
  committeeSummary: string;
  finalRecommendation: string;
};

function roleAnswers(input: string): CommitteeRoleAnswer[] {
  const trimmed = input.trim() || 'Welche Entscheidung soll bewertet werden?';
  return [
    {
      id: 'visionary',
      name: 'Visionär',
      focus: 'Zielbild, Chancen, langfristiger Nutzen',
      answer: 'Chance prüfen: Wenn die Entscheidung das Ziel des Master-Agenten stärkt, kann sie sinnvoll sein. Wichtig ist, sie nicht vor Datenschutz und Stabilität zu stellen.',
    },
    {
      id: 'skeptic',
      name: 'Skeptiker',
      focus: 'Risiken, Gegenargumente, blinde Flecken',
      answer: 'Risiko prüfen: Nicht zu früh live gehen, keine internen Daten extern senden und keine Fähigkeiten behaupten, die lokal noch nicht sicher funktionieren.',
    },
    {
      id: 'operator',
      name: 'Umsetzer',
      focus: 'Nächster konkreter Schritt, Testbarkeit, Aufwand',
      answer: 'Praktisch vorgehen: Eine kleine lokale Verbesserung bauen, verifizieren, builden, committen und erst danach den nächsten Schritt starten.',
    },
    {
      id: 'privacy_risk',
      name: 'Datenschutz & Risiko',
      focus: 'Privacy Gate, interne Daten, Freigabegrenzen',
      answer: 'Datenschutz bleibt vorrangig: local_only ist sicher. Anonymisierung nur als Vorschau. approve_external_send bleibt blockiert, bis eine separate Live-Freigabe existiert.',
    },
    {
      id: 'business_value',
      name: 'Wirtschaftlichkeit & Praxisnutzen',
      focus: 'Nutzen, Priorität, Wirkung für den Alltag',
      answer: 'Nutzen entsteht, wenn der Agent verlässlich routet, klar antwortet und Entscheidungen beschleunigt. Priorität hat daher Qualität vor Live-Schaltung.',
    },
  ].map((role) => ({ ...role, answer: role.answer + ' Eingabe: ' + trimmed.slice(0, 120) }));
}

function summary(triggered: boolean) {
  if (!triggered) {
    return 'Das 5er-Gremium wurde nicht zwingend benötigt. Die Eingabe kann lokal direkt oder über das Privacy Gate verarbeitet werden.';
  }
  return 'Das 5er-Gremium bewertet die Frage aus Chancen, Risiken, Umsetzung, Datenschutz und Praxisnutzen. Alle Rollen empfehlen: lokal weiter testen, Datenschutzgrenzen einhalten und keine Live-Schaltung ohne separate Freigabe.';
}

function recommendation(triggered: boolean) {
  if (!triggered) {
    return 'Lokal beantworten. Falls die Frage zur Entscheidung wird, das Gremium erneut aktivieren.';
  }
  return 'Empfehlung: Nicht live schalten. Erst die lokale Qualität und Gremiumsausgabe stabilisieren, danach Provider-Readiness vorbereiten, aber weiterhin blockiert lassen.';
}

export function askSecureMasterCommittee(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterCommitteeResult {
  const quality = askSecureMasterQuality(input, option);
  const committeeTriggered = quality.detectedIntent === 'committee_decision' || quality.finalRoute === 'committee';
  return {
    ...quality,
    phaseCommittee: '125.0',
    committeeLabel: 'Secure Master Committee Integration',
    committeeTriggered,
    committeeRoles: committeeTriggered ? roleAnswers(input) : [],
    committeeSummary: summary(committeeTriggered),
    finalRecommendation: recommendation(committeeTriggered),
  };
}

export function getSecureMasterCommitteeDemo() {
  return askSecureMasterCommittee('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?', 'local_only');
}
