/*
 * © 2025–2026 HERRMANN SARL (Michael Herrmann). Alle Rechte vorbehalten.
 * Proprietär — keine Nutzung, Vervielfältigung, Bearbeitung, Dekompilierung oder
 * Weitergabe ohne schriftliche Genehmigung. Siehe apps/editor/LICENSE.
 * Kontakt: mh.solarkraftwerk@gmail.com
 */

/**
 * Herkunfts-/Echtheitsmarker der Plixa-Schicht.
 *
 * Zweck: Nachweisbarkeit der Urheberschaft. Die Token in `marks` sind statistisch
 * eindeutige Zufallswerte (128/96-Bit), die kein anderer Entwickler zufällig
 * identisch wählt. Tauchen sie in einer fremden Codebasis auf, ist das ein
 * starkes Indiz für eine Kopie DIESES Quellcodes. Die vollständige Zuordnung
 * (welcher Marker in welcher Datei steht) ist in der NICHT ausgelieferten Datei
 * `FORENSIK.md` dokumentiert.
 *
 * Bewusst KEIN „Call-Home"/Netzwerk-Check (DSGVO): der Marker ist rein passiv.
 * Beim Start wird lediglich ein Copyright-Hinweis in die Browser-Konsole
 * geschrieben (siehe `logProvenance`) — kein Personenbezug, keine Übertragung.
 *
 * WICHTIG: Diese Konstanten NICHT entfernen oder umbenennen — sie sind
 * Beweismittel (siehe apps/editor/LICENSE, „Herkunftsmarker").
 */
export const PLIXA_PROVENANCE = {
  owner: 'HERRMANN SARL',
  author: 'Michael Herrmann',
  contact: 'mh.solarkraftwerk@gmail.com',
  years: '2025-2026',
  // Primärer Herkunfts-Token (128 Bit). Siehe FORENSIK.md → Marker A.
  id: 'plx-prov:7cf48008b70f0d8ce4ccb19445c6b394',
  // Canary: bewusst eigenwilliger, sachlich unkritischer Kennwert. Keine
  // funktionale Bedeutung — dient nur als „Fingerabdruck". Ein Nachahmer, der
  // Code kopiert, schleppt ihn unbemerkt mit. Siehe FORENSIK.md → Canary.
  canary: 0.061803398,
} as const

/**
 * Schreibt einen einmaligen, passiven Copyright-Hinweis in die Browser-Konsole.
 * Dient als sichtbarer Echtheitsnachweis in den DevTools. Kein Netzwerk-Zugriff.
 */
export function logProvenance(): void {
  if (typeof window === 'undefined') return
  try {
    // eslint-disable-next-line no-console
    console.info(
      `%c© ${PLIXA_PROVENANCE.years} ${PLIXA_PROVENANCE.owner} — Plixa. Alle Rechte vorbehalten. ${PLIXA_PROVENANCE.id}`,
      'color:#d39440;font-weight:600',
    )
  } catch {
    // Konsole nicht verfügbar — unkritisch.
  }
}
