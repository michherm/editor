/**
 * Aufbau-Rezepte (Finishes) für die Mengen-/Kostenkalkulation.
 *
 * Ein „Finish" ist eine Oberflächen-/Aufbauwahl, die der Nutzer einer Fläche des
 * Hauses geben kann (Dachziegel, Tapete, Parkett, Holzvertäfelung …). Jedes
 * Rezept beschreibt, WAS pro m² fertiger Fläche verbaut wird (Bauteile mit Menge
 * pro m²). Fläche-m² × Rezept → Stückliste + geschätzte Kosten (siehe calculate.ts).
 *
 * Die Mengen sind branchenübliche RICHTWERTE als Startwerte — Michael kann sie
 * (und vor allem die Preise) später anpassen. Preise sind bewusst offen
 * (`unitPriceEur` fehlt), bis echte Geschäftsdaten hinterlegt werden.
 *
 * Bewusst in apps/editor (Plixa-App), NICHT in packages/core: das sind
 * Plixa-Geschäftsdaten (Bau-Rezepte/Kalkulation), kein Teil des quelloffenen Kerns.
 */

/** Welche Hausfläche eine Belegung bekommen kann (deckt sich mit dem Plixa-Flächen-Manifest). */
export type SurfaceKind =
  | 'roof'
  | 'wall-exterior'
  | 'wall-interior'
  | 'floor'
  | 'ceiling'

/** Mengeneinheit eines Bauteils. */
export type CalcUnit = 'Stk' | 'm²' | 'lfm' | 'kg' | 'l'

/** Ein Bauteil, das pro m² fertiger Fläche verbraucht wird. */
export type FinishComponent = {
  /** Stabile id (für spätere Preis-Zuordnung / i18n). */
  key: string
  /** Anzeigename (Deutsch als App-Standard; i18n folgt mit dem Panel-UI). */
  label: string
  unit: CalcUnit
  /** Menge pro m² fertiger Fläche. */
  perM2: number
  /** Zuschlag für Verschnitt/Bruch in % (optional, Standard 0). */
  wastePct?: number
  /** Preis pro Einheit in € (optional — trägt Michael später ein). */
  unitPriceEur?: number
}

/** Eine wählbare Oberflächen-/Aufbauvariante für eine Fläche. */
export type Finish = {
  id: string
  label: string
  /** Grobe Kategorie (für Gruppierung/Filter in der Auswahl). */
  category: 'roof' | 'wall' | 'ceiling' | 'floor'
  /** Auf welche Flächenarten diese Belegung passt. */
  appliesTo: SurfaceKind[]
  /** Optionale Verknüpfung zu einer Katalog-Material-id (für die sichtbare Optik-Schicht). */
  materialId?: string
  /** Der Aufbau: Bauteile je m². */
  components: FinishComponent[]
}

export const FINISHES: Finish[] = [
  // ── Dach ────────────────────────────────────────────────────────────────
  {
    id: 'roof-ziegel-rot',
    label: 'Tondachziegel rot',
    category: 'roof',
    appliesTo: ['roof'],
    components: [
      { key: 'dachziegel', label: 'Dachziegel (rot)', unit: 'Stk', perM2: 12, wastePct: 5 },
      { key: 'dachlatte', label: 'Dachlatte 30/50', unit: 'lfm', perM2: 3.0, wastePct: 5 },
      { key: 'konterlatte', label: 'Konterlatte 30/50', unit: 'lfm', perM2: 1.6, wastePct: 5 },
      { key: 'unterdeckbahn', label: 'Unterdeckbahn', unit: 'm²', perM2: 1.05, wastePct: 10 },
      { key: 'sturmklammer', label: 'Sturmklammern', unit: 'Stk', perM2: 4 },
      { key: 'schrauben', label: 'Schrauben', unit: 'Stk', perM2: 12 },
    ],
  },
  {
    id: 'roof-blech',
    label: 'Blecheindeckung (Stehfalz)',
    category: 'roof',
    appliesTo: ['roof'],
    components: [
      { key: 'blechbahn', label: 'Stehfalz-Blechbahn', unit: 'm²', perM2: 1.1, wastePct: 8 },
      { key: 'trennlage', label: 'Trennlage/Vlies', unit: 'm²', perM2: 1.05, wastePct: 5 },
      { key: 'haften', label: 'Haften/Klammern', unit: 'Stk', perM2: 10 },
    ],
  },
  {
    id: 'roof-aufdachdaemmung',
    label: 'Aufdachdämmung (PIR 100 mm)',
    category: 'roof',
    appliesTo: ['roof'],
    components: [
      { key: 'daemmplatte', label: 'PIR-Dämmplatte 100 mm', unit: 'm²', perM2: 1.02, wastePct: 5 },
      { key: 'unterdeckbahn', label: 'Unterdeckbahn', unit: 'm²', perM2: 1.05, wastePct: 10 },
      { key: 'konterlatte', label: 'Konterlatte (lang)', unit: 'lfm', perM2: 1.6, wastePct: 5 },
      { key: 'systemschraube', label: 'Systemschrauben (lang)', unit: 'Stk', perM2: 6 },
    ],
  },
  // ── Wand ────────────────────────────────────────────────────────────────
  {
    id: 'wall-tapete',
    label: 'Tapete',
    category: 'wall',
    appliesTo: ['wall-interior'],
    components: [
      { key: 'tapetenbahn', label: 'Tapetenbahn', unit: 'm²', perM2: 1.15, wastePct: 15 },
      { key: 'kleister', label: 'Kleister', unit: 'kg', perM2: 0.25 },
    ],
  },
  {
    id: 'wall-anstrich',
    label: 'Wandanstrich',
    category: 'wall',
    appliesTo: ['wall-interior', 'wall-exterior'],
    components: [
      { key: 'wandfarbe', label: 'Wandfarbe (2 Anstriche)', unit: 'l', perM2: 0.3 },
      { key: 'grundierung', label: 'Grundierung', unit: 'l', perM2: 0.12 },
    ],
  },
  {
    id: 'wall-holzvertaefelung',
    label: 'Holzvertäfelung (Profilholz)',
    category: 'wall',
    appliesTo: ['wall-interior', 'wall-exterior'],
    components: [
      { key: 'profilbrett', label: 'Profilbretter', unit: 'm²', perM2: 1.1, wastePct: 10 },
      { key: 'traglatte', label: 'Traglatten 24/48', unit: 'lfm', perM2: 2.6, wastePct: 5 },
      { key: 'naegel', label: 'Nägel/Klammern', unit: 'Stk', perM2: 25 },
    ],
  },
  {
    id: 'wall-fliesen',
    label: 'Wandfliesen',
    category: 'wall',
    appliesTo: ['wall-interior'],
    components: [
      { key: 'fliesen', label: 'Wandfliesen', unit: 'm²', perM2: 1.1, wastePct: 10 },
      { key: 'fliesenkleber', label: 'Fliesenkleber', unit: 'kg', perM2: 3.5 },
      { key: 'fugenmoertel', label: 'Fugenmörtel', unit: 'kg', perM2: 0.4 },
    ],
  },
  // ── Boden ───────────────────────────────────────────────────────────────
  {
    id: 'floor-parkett',
    label: 'Parkett',
    category: 'floor',
    appliesTo: ['floor'],
    components: [
      { key: 'parkettdiele', label: 'Parkettdielen', unit: 'm²', perM2: 1.05, wastePct: 5 },
      { key: 'trittschall', label: 'Trittschalldämmung', unit: 'm²', perM2: 1.0 },
      { key: 'sockelleiste', label: 'Sockelleisten', unit: 'lfm', perM2: 0.9 },
    ],
  },
  {
    id: 'floor-fliesen',
    label: 'Bodenfliesen',
    category: 'floor',
    appliesTo: ['floor'],
    components: [
      { key: 'fliesen', label: 'Bodenfliesen', unit: 'm²', perM2: 1.08, wastePct: 8 },
      { key: 'fliesenkleber', label: 'Fliesenkleber', unit: 'kg', perM2: 4 },
      { key: 'fugenmoertel', label: 'Fugenmörtel', unit: 'kg', perM2: 0.5 },
    ],
  },
  {
    id: 'floor-laminat',
    label: 'Laminat',
    category: 'floor',
    appliesTo: ['floor'],
    components: [
      { key: 'laminatdiele', label: 'Laminatdielen', unit: 'm²', perM2: 1.05, wastePct: 5 },
      { key: 'trittschall', label: 'Trittschalldämmung', unit: 'm²', perM2: 1.0 },
      { key: 'sockelleiste', label: 'Sockelleisten', unit: 'lfm', perM2: 0.9 },
    ],
  },
  // ── Decke ───────────────────────────────────────────────────────────────
  {
    id: 'ceiling-holzvertaefelung',
    label: 'Decken-Holzvertäfelung',
    category: 'ceiling',
    appliesTo: ['ceiling'],
    components: [
      { key: 'profilbrett', label: 'Profilbretter', unit: 'm²', perM2: 1.1, wastePct: 10 },
      { key: 'traglatte', label: 'Traglatten 24/48', unit: 'lfm', perM2: 2.8, wastePct: 5 },
      { key: 'schrauben', label: 'Schrauben', unit: 'Stk', perM2: 20 },
    ],
  },
  {
    id: 'ceiling-anstrich',
    label: 'Deckenanstrich',
    category: 'ceiling',
    appliesTo: ['ceiling'],
    components: [
      { key: 'deckenfarbe', label: 'Deckenfarbe (2 Anstriche)', unit: 'l', perM2: 0.3 },
      { key: 'grundierung', label: 'Grundierung', unit: 'l', perM2: 0.12 },
    ],
  },
]

export function getFinishById(id: string): Finish | undefined {
  return FINISHES.find((f) => f.id === id)
}

/** Passende Belegungen für eine Flächenart (z. B. nur Dach-Rezepte fürs Dach). */
export function finishesForSurfaceKind(kind: SurfaceKind): Finish[] {
  return FINISHES.filter((f) => f.appliesTo.includes(kind))
}
