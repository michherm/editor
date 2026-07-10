/**
 * Sichtbare Editor-Strings in 12 Sprachen (`de, fr, en, pl, it, es, nl, pt, cs,
 * sv, da, ro`) — dieselben Sprachen wie die Plixa-Haupt-App.
 *
 * Umfang: die Oberflächen-Texte des Forks (App-Rahmen, Sidebar-Tabs,
 * Sprachumschalter) und das Plixa-CNC-Panel (`packages/plixa-stairs/src/panel.tsx`).
 * Technische Engine-Ausgaben (DIN-Verstöße, Hinweise, Disclaimer) kommen aus
 * `cnc.ts` und bleiben bewusst unangetastet.
 */

export type Translation = {
  app: { localScenes: string; openRecent: string; createNew: string }
  tab: { scene: string; build: string; items: string; settings: string }
  ls: { search: string; none: string }
  cnc: {
    heading: string
    previewNote: string
    risersTreads: string
    riserGoing: string
    stepFormula: string
    dinOk: string
    dinFail: string
    parts: string
    colPart: string
    colQty: string
    colDim: string
    colArea: string
    nesting: string
    partsWord: string
    layersWord: string
    wasteWord: string
    platesWord: string
    material: string
    nextStep: string
  }
}

const de: Translation = {
  app: {
    localScenes: 'Lokaler Editor — Szenen werden nicht gespeichert.',
    openRecent: 'Zuletzt geöffnete Szenen',
    createNew: 'Neu erstellen',
  },
  tab: { scene: 'Szene', build: 'Bauen', items: 'Objekte', settings: 'Einstellungen' },
  ls: { search: 'Sprache suchen…', none: 'Kein Treffer' },
  cnc: {
    heading: 'Plixa CNC / Fertigung',
    previewNote:
      'Vorschau mit Standard-Treppe. Wähle im Editor eine Treppe — dann rechnet Plixa mit deren Maßen.',
    risersTreads: 'Steigungen × Tritte',
    riserGoing: 'Steigung / Auftritt',
    stepFormula: 'Schrittmaß 2·St+A',
    dinOk: 'DIN 18065: Maße im Rahmen (Vorprüfung)',
    dinFail: 'DIN 18065:',
    parts: 'Frästeile',
    colPart: 'Teil',
    colQty: 'Stk',
    colDim: 'L × B (mm)',
    colArea: 'm²/Stk',
    nesting: 'Plattenbedarf (Nesting)',
    partsWord: 'Teile',
    layersWord: 'Lage(n)',
    wasteWord: 'Verschnitt',
    platesWord: 'Platten',
    material: 'Material',
    nextStep:
      'Nächster Ausbau: DXF/3dm-Export der Teile + EC5-Statik-Bericht über die Plixa-Engine.',
  },
}

const en: Translation = {
  app: {
    localScenes: 'Local editor — scenes are not saved.',
    openRecent: 'Open recent scenes',
    createNew: 'Create new',
  },
  tab: { scene: 'Scene', build: 'Build', items: 'Items', settings: 'Settings' },
  ls: { search: 'Search language…', none: 'No match' },
  cnc: {
    heading: 'Plixa CNC / Manufacturing',
    previewNote:
      'Preview with a default stair. Select a stair in the editor and Plixa computes with its dimensions.',
    risersTreads: 'Risers × treads',
    riserGoing: 'Riser / going',
    stepFormula: 'Step formula 2·R+G',
    dinOk: 'DIN 18065: dimensions within range (pre-check)',
    dinFail: 'DIN 18065:',
    parts: 'Milled parts',
    colPart: 'Part',
    colQty: 'Qty',
    colDim: 'L × W (mm)',
    colArea: 'm²/pc',
    nesting: 'Sheet demand (nesting)',
    partsWord: 'of parts',
    layersWord: 'layer(s)',
    wasteWord: 'Waste',
    platesWord: 'sheets',
    material: 'Material',
    nextStep:
      'Next step: DXF/3dm export of the parts + EC5 structural report via the Plixa engine.',
  },
}

const fr: Translation = {
  app: {
    localScenes: 'Éditeur local — les scènes ne sont pas enregistrées.',
    openRecent: 'Ouvrir les scènes récentes',
    createNew: 'Créer',
  },
  tab: { scene: 'Scène', build: 'Construire', items: 'Objets', settings: 'Réglages' },
  ls: { search: 'Rechercher une langue…', none: 'Aucun résultat' },
  cnc: {
    heading: 'Plixa CNC / Fabrication',
    previewNote:
      "Aperçu avec un escalier par défaut. Sélectionnez un escalier dans l'éditeur — Plixa calcule alors avec ses dimensions.",
    risersTreads: 'Contremarches × marches',
    riserGoing: 'Hauteur / giron',
    stepFormula: 'Formule du pas 2·H+G',
    dinOk: 'DIN 18065 : dimensions dans la plage (pré-vérification)',
    dinFail: 'DIN 18065 :',
    parts: 'Pièces usinées',
    colPart: 'Pièce',
    colQty: 'Qté',
    colDim: 'L × l (mm)',
    colArea: 'm²/pce',
    nesting: 'Besoin en panneaux (imbrication)',
    partsWord: 'de pièces',
    layersWord: 'couche(s)',
    wasteWord: 'Chute',
    platesWord: 'panneaux',
    material: 'Matériau',
    nextStep:
      'Prochaine étape : export DXF/3dm des pièces + rapport structurel EC5 via le moteur Plixa.',
  },
}

const pl: Translation = {
  app: {
    localScenes: 'Edytor lokalny — sceny nie są zapisywane.',
    openRecent: 'Otwórz ostatnie sceny',
    createNew: 'Utwórz nową',
  },
  tab: { scene: 'Scena', build: 'Buduj', items: 'Obiekty', settings: 'Ustawienia' },
  ls: { search: 'Szukaj języka…', none: 'Brak wyników' },
  cnc: {
    heading: 'Plixa CNC / Produkcja',
    previewNote:
      'Podgląd ze schodami domyślnymi. Wybierz schody w edytorze — Plixa policzy według ich wymiarów.',
    risersTreads: 'Podstopnice × stopnice',
    riserGoing: 'Podstopnica / stopnica',
    stepFormula: 'Wzór schodowy 2·h+s',
    dinOk: 'DIN 18065: wymiary w zakresie (kontrola wstępna)',
    dinFail: 'DIN 18065:',
    parts: 'Elementy frezowane',
    colPart: 'Element',
    colQty: 'Szt',
    colDim: 'Dł × Szer (mm)',
    colArea: 'm²/szt',
    nesting: 'Zapotrzebowanie na płyty (nesting)',
    partsWord: 'elementów',
    layersWord: 'warstwa(y)',
    wasteWord: 'Odpad',
    platesWord: 'płyt',
    material: 'Materiał',
    nextStep:
      'Następny krok: eksport DXF/3dm elementów + raport konstrukcyjny EC5 przez silnik Plixa.',
  },
}

const it: Translation = {
  app: {
    localScenes: 'Editor locale — le scene non vengono salvate.',
    openRecent: 'Apri scene recenti',
    createNew: 'Crea nuovo',
  },
  tab: { scene: 'Scena', build: 'Costruisci', items: 'Oggetti', settings: 'Impostazioni' },
  ls: { search: 'Cerca lingua…', none: 'Nessun risultato' },
  cnc: {
    heading: 'Plixa CNC / Produzione',
    previewNote:
      "Anteprima con scala predefinita. Seleziona una scala nell'editor — Plixa calcolerà con le sue misure.",
    risersTreads: 'Alzate × pedate',
    riserGoing: 'Alzata / pedata',
    stepFormula: 'Formula del passo 2·A+P',
    dinOk: 'DIN 18065: misure nei limiti (pre-verifica)',
    dinFail: 'DIN 18065:',
    parts: 'Pezzi fresati',
    colPart: 'Pezzo',
    colQty: 'Pz',
    colDim: 'L × La (mm)',
    colArea: 'm²/pz',
    nesting: 'Fabbisogno pannelli (nesting)',
    partsWord: 'di pezzi',
    layersWord: 'strato/i',
    wasteWord: 'Sfrido',
    platesWord: 'pannelli',
    material: 'Materiale',
    nextStep:
      'Prossimo passo: esportazione DXF/3dm dei pezzi + relazione strutturale EC5 tramite il motore Plixa.',
  },
}

const es: Translation = {
  app: {
    localScenes: 'Editor local — las escenas no se guardan.',
    openRecent: 'Abrir escenas recientes',
    createNew: 'Crear nuevo',
  },
  tab: { scene: 'Escena', build: 'Construir', items: 'Objetos', settings: 'Ajustes' },
  ls: { search: 'Buscar idioma…', none: 'Sin resultados' },
  cnc: {
    heading: 'Plixa CNC / Fabricación',
    previewNote:
      'Vista previa con escalera predeterminada. Selecciona una escalera en el editor y Plixa calculará con sus medidas.',
    risersTreads: 'Contrahuellas × huellas',
    riserGoing: 'Contrahuella / huella',
    stepFormula: 'Fórmula del paso 2·C+H',
    dinOk: 'DIN 18065: medidas dentro del rango (comprobación previa)',
    dinFail: 'DIN 18065:',
    parts: 'Piezas fresadas',
    colPart: 'Pieza',
    colQty: 'Ud',
    colDim: 'L × An (mm)',
    colArea: 'm²/ud',
    nesting: 'Necesidad de tableros (nesting)',
    partsWord: 'de piezas',
    layersWord: 'capa(s)',
    wasteWord: 'Desperdicio',
    platesWord: 'tableros',
    material: 'Material',
    nextStep:
      'Siguiente paso: exportación DXF/3dm de las piezas + informe estructural EC5 mediante el motor Plixa.',
  },
}

const nl: Translation = {
  app: {
    localScenes: 'Lokale editor — scènes worden niet opgeslagen.',
    openRecent: 'Recente scènes openen',
    createNew: 'Nieuw maken',
  },
  tab: { scene: 'Scène', build: 'Bouwen', items: 'Objecten', settings: 'Instellingen' },
  ls: { search: 'Taal zoeken…', none: 'Geen resultaat' },
  cnc: {
    heading: 'Plixa CNC / Productie',
    previewNote:
      'Voorbeeld met standaardtrap. Selecteer een trap in de editor — dan rekent Plixa met de bijbehorende maten.',
    risersTreads: 'Optreden × aantreden',
    riserGoing: 'Optrede / aantrede',
    stepFormula: 'Schredemaat 2·O+A',
    dinOk: 'DIN 18065: maten binnen bereik (voorcontrole)',
    dinFail: 'DIN 18065:',
    parts: 'Freesdelen',
    colPart: 'Deel',
    colQty: 'St',
    colDim: 'L × B (mm)',
    colArea: 'm²/st',
    nesting: 'Plaatbehoefte (nesting)',
    partsWord: 'delen',
    layersWord: 'laag/lagen',
    wasteWord: 'Versnijding',
    platesWord: 'platen',
    material: 'Materiaal',
    nextStep:
      'Volgende stap: DXF/3dm-export van de delen + EC5-constructierapport via de Plixa-engine.',
  },
}

const pt: Translation = {
  app: {
    localScenes: 'Editor local — as cenas não são guardadas.',
    openRecent: 'Abrir cenas recentes',
    createNew: 'Criar nova',
  },
  tab: { scene: 'Cena', build: 'Construir', items: 'Objetos', settings: 'Definições' },
  ls: { search: 'Procurar idioma…', none: 'Sem resultados' },
  cnc: {
    heading: 'Plixa CNC / Fabrico',
    previewNote:
      'Pré-visualização com escada padrão. Selecione uma escada no editor — o Plixa calcula com as suas medidas.',
    risersTreads: 'Espelhos × cobertores',
    riserGoing: 'Espelho / cobertor',
    stepFormula: 'Fórmula do degrau 2·E+C',
    dinOk: 'DIN 18065: medidas dentro do intervalo (pré-verificação)',
    dinFail: 'DIN 18065:',
    parts: 'Peças fresadas',
    colPart: 'Peça',
    colQty: 'Un',
    colDim: 'C × L (mm)',
    colArea: 'm²/un',
    nesting: 'Necessidade de placas (nesting)',
    partsWord: 'de peças',
    layersWord: 'camada(s)',
    wasteWord: 'Desperdício',
    platesWord: 'placas',
    material: 'Material',
    nextStep:
      'Próximo passo: exportação DXF/3dm das peças + relatório estrutural EC5 através do motor Plixa.',
  },
}

const cs: Translation = {
  app: {
    localScenes: 'Místní editor — scény se neukládají.',
    openRecent: 'Otevřít nedávné scény',
    createNew: 'Vytvořit novou',
  },
  tab: { scene: 'Scéna', build: 'Stavět', items: 'Objekty', settings: 'Nastavení' },
  ls: { search: 'Hledat jazyk…', none: 'Žádný výsledek' },
  cnc: {
    heading: 'Plixa CNC / Výroba',
    previewNote:
      'Náhled s výchozím schodištěm. Vyberte v editoru schodiště — Plixa spočítá podle jeho rozměrů.',
    risersTreads: 'Podstupnice × stupnice',
    riserGoing: 'Výška / šířka stupně',
    stepFormula: 'Kroková formule 2·V+Š',
    dinOk: 'DIN 18065: rozměry v rozsahu (předběžná kontrola)',
    dinFail: 'DIN 18065:',
    parts: 'Frézované díly',
    colPart: 'Díl',
    colQty: 'Ks',
    colDim: 'D × Š (mm)',
    colArea: 'm²/ks',
    nesting: 'Potřeba desek (nesting)',
    partsWord: 'dílů',
    layersWord: 'vrstva(y)',
    wasteWord: 'Prořez',
    platesWord: 'desek',
    material: 'Materiál',
    nextStep:
      'Další krok: export DXF/3dm dílů + statická zpráva EC5 přes engine Plixa.',
  },
}

const sv: Translation = {
  app: {
    localScenes: 'Lokal editor — scener sparas inte.',
    openRecent: 'Öppna senaste scener',
    createNew: 'Skapa ny',
  },
  tab: { scene: 'Scen', build: 'Bygg', items: 'Objekt', settings: 'Inställningar' },
  ls: { search: 'Sök språk…', none: 'Ingen träff' },
  cnc: {
    heading: 'Plixa CNC / Tillverkning',
    previewNote:
      'Förhandsvisning med standardtrappa. Välj en trappa i editorn — då räknar Plixa med dess mått.',
    risersTreads: 'Sättsteg × plansteg',
    riserGoing: 'Sättsteg / plansteg',
    stepFormula: 'Stegformel 2·S+P',
    dinOk: 'DIN 18065: mått inom intervallet (förkontroll)',
    dinFail: 'DIN 18065:',
    parts: 'Frästa delar',
    colPart: 'Del',
    colQty: 'St',
    colDim: 'L × B (mm)',
    colArea: 'm²/st',
    nesting: 'Skivbehov (nesting)',
    partsWord: 'delar',
    layersWord: 'lager',
    wasteWord: 'Spill',
    platesWord: 'skivor',
    material: 'Material',
    nextStep:
      'Nästa steg: DXF/3dm-export av delarna + EC5-konstruktionsrapport via Plixa-motorn.',
  },
}

const da: Translation = {
  app: {
    localScenes: 'Lokal editor — scener gemmes ikke.',
    openRecent: 'Åbn seneste scener',
    createNew: 'Opret ny',
  },
  tab: { scene: 'Scene', build: 'Byg', items: 'Objekter', settings: 'Indstillinger' },
  ls: { search: 'Søg sprog…', none: 'Ingen match' },
  cnc: {
    heading: 'Plixa CNC / Fremstilling',
    previewNote:
      'Forhåndsvisning med standardtrappe. Vælg en trappe i editoren — så regner Plixa med dens mål.',
    risersTreads: 'Stødtrin × trin',
    riserGoing: 'Stødtrin / trin',
    stepFormula: 'Trinformel 2·S+G',
    dinOk: 'DIN 18065: mål inden for intervallet (forkontrol)',
    dinFail: 'DIN 18065:',
    parts: 'Fræsede dele',
    colPart: 'Del',
    colQty: 'Stk',
    colDim: 'L × B (mm)',
    colArea: 'm²/stk',
    nesting: 'Pladebehov (nesting)',
    partsWord: 'dele',
    layersWord: 'lag',
    wasteWord: 'Spild',
    platesWord: 'plader',
    material: 'Materiale',
    nextStep:
      'Næste skridt: DXF/3dm-eksport af delene + EC5-konstruktionsrapport via Plixa-motoren.',
  },
}

const ro: Translation = {
  app: {
    localScenes: 'Editor local — scenele nu sunt salvate.',
    openRecent: 'Deschide scene recente',
    createNew: 'Creează',
  },
  tab: { scene: 'Scenă', build: 'Construiește', items: 'Obiecte', settings: 'Setări' },
  ls: { search: 'Caută limba…', none: 'Niciun rezultat' },
  cnc: {
    heading: 'Plixa CNC / Fabricație',
    previewNote:
      'Previzualizare cu scară implicită. Selectează o scară în editor — Plixa va calcula cu dimensiunile ei.',
    risersTreads: 'Contratrepte × trepte',
    riserGoing: 'Contratreaptă / treaptă',
    stepFormula: 'Formula pasului 2·C+T',
    dinOk: 'DIN 18065: dimensiuni în interval (verificare preliminară)',
    dinFail: 'DIN 18065:',
    parts: 'Piese frezate',
    colPart: 'Piesă',
    colQty: 'Buc',
    colDim: 'L × l (mm)',
    colArea: 'm²/buc',
    nesting: 'Necesar de plăci (nesting)',
    partsWord: 'de piese',
    layersWord: 'strat(uri)',
    wasteWord: 'Pierdere',
    platesWord: 'plăci',
    material: 'Material',
    nextStep:
      'Pasul următor: export DXF/3dm al pieselor + raport structural EC5 prin motorul Plixa.',
  },
}

export const resources = {
  de: { translation: de },
  en: { translation: en },
  fr: { translation: fr },
  pl: { translation: pl },
  it: { translation: it },
  es: { translation: es },
  nl: { translation: nl },
  pt: { translation: pt },
  cs: { translation: cs },
  sv: { translation: sv },
  da: { translation: da },
  ro: { translation: ro },
} as const
