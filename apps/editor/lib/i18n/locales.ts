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
  ai: {
    heading: string
    intro: string
    example: string
    placeholder: string
    send: string
    thinking: string
    usingTool: string
    notConfigured: string
    failed: string
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
  ai: {
    heading: 'Plixa KI',
    intro: 'Beschreibe, was gebaut werden soll — Plixa ändert die Szene live.',
    example: 'z. B. „großes Wohnzimmer mit offener Küche und Treppe nach oben"',
    placeholder: 'Raum, Möbel, Treppe … beschreiben',
    send: 'Senden',
    thinking: 'Denkt nach…',
    usingTool: 'Werkzeug: {{tool}}',
    notConfigured: 'Die KI ist noch nicht konfiguriert (kein API-Schlüssel auf dem Server).',
    failed: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
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
  ai: {
    heading: 'Plixa AI',
    intro: 'Describe what to build — Plixa changes the scene live.',
    example: 'e.g. "a large living room with an open kitchen and stairs going up"',
    placeholder: 'Describe a room, furniture, stairs…',
    send: 'Send',
    thinking: 'Thinking…',
    usingTool: 'Tool: {{tool}}',
    notConfigured: 'AI is not configured yet (no API key on the server).',
    failed: 'Something went wrong. Please try again.',
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
  ai: {
    heading: 'Plixa IA',
    intro: 'Décris ce qu\'il faut construire — Plixa modifie la scène en direct.',
    example: 'p. ex. « grand salon avec cuisine ouverte et escalier vers le haut »',
    placeholder: 'Décris une pièce, des meubles, un escalier…',
    send: 'Envoyer',
    thinking: 'Réflexion…',
    usingTool: 'Outil : {{tool}}',
    notConfigured: 'L\'IA n\'est pas encore configurée (pas de clé API sur le serveur).',
    failed: 'Une erreur s\'est produite. Réessaie.',
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
  ai: {
    heading: 'Plixa AI',
    intro: 'Opisz, co zbudować — Plixa zmienia scenę na żywo.',
    example: 'np. „duży salon z otwartą kuchnią i schodami w górę"',
    placeholder: 'Opisz pokój, meble, schody…',
    send: 'Wyślij',
    thinking: 'Myślę…',
    usingTool: 'Narzędzie: {{tool}}',
    notConfigured: 'AI nie jest jeszcze skonfigurowane (brak klucza API na serwerze).',
    failed: 'Coś poszło nie tak. Spróbuj ponownie.',
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
  ai: {
    heading: 'Plixa IA',
    intro: 'Descrivi cosa costruire — Plixa modifica la scena in tempo reale.',
    example: 'es. «grande soggiorno con cucina a vista e scala verso l\'alto»',
    placeholder: 'Descrivi una stanza, mobili, una scala…',
    send: 'Invia',
    thinking: 'Sto pensando…',
    usingTool: 'Strumento: {{tool}}',
    notConfigured: 'L\'IA non è ancora configurata (nessuna chiave API sul server).',
    failed: 'Qualcosa è andato storto. Riprova.',
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
  ai: {
    heading: 'Plixa IA',
    intro: 'Describe qué construir — Plixa cambia la escena en vivo.',
    example: 'p. ej. «salón grande con cocina abierta y escalera hacia arriba»',
    placeholder: 'Describe una habitación, muebles, una escalera…',
    send: 'Enviar',
    thinking: 'Pensando…',
    usingTool: 'Herramienta: {{tool}}',
    notConfigured: 'La IA aún no está configurada (sin clave API en el servidor).',
    failed: 'Algo salió mal. Inténtalo de nuevo.',
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
  ai: {
    heading: 'Plixa AI',
    intro: 'Beschrijf wat er gebouwd moet worden — Plixa past de scène live aan.',
    example: 'bijv. "grote woonkamer met open keuken en trap naar boven"',
    placeholder: 'Beschrijf een kamer, meubels, een trap…',
    send: 'Verstuur',
    thinking: 'Denkt na…',
    usingTool: 'Tool: {{tool}}',
    notConfigured: 'De AI is nog niet geconfigureerd (geen API-sleutel op de server).',
    failed: 'Er ging iets mis. Probeer het opnieuw.',
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
  ai: {
    heading: 'Plixa IA',
    intro: 'Descreve o que construir — o Plixa altera a cena em direto.',
    example: 'p. ex. «sala grande com cozinha aberta e escada para cima»',
    placeholder: 'Descreve uma divisão, móveis, uma escada…',
    send: 'Enviar',
    thinking: 'A pensar…',
    usingTool: 'Ferramenta: {{tool}}',
    notConfigured: 'A IA ainda não está configurada (sem chave API no servidor).',
    failed: 'Algo correu mal. Tenta novamente.',
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
  ai: {
    heading: 'Plixa AI',
    intro: 'Popiš, co postavit — Plixa mění scénu živě.',
    example: 'např. „velký obývací pokoj s otevřenou kuchyní a schody nahoru"',
    placeholder: 'Popiš místnost, nábytek, schodiště…',
    send: 'Odeslat',
    thinking: 'Přemýšlím…',
    usingTool: 'Nástroj: {{tool}}',
    notConfigured: 'AI zatím není nakonfigurováno (na serveru chybí API klíč).',
    failed: 'Něco se pokazilo. Zkus to znovu.',
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
  ai: {
    heading: 'Plixa AI',
    intro: 'Beskriv vad som ska byggas — Plixa ändrar scenen live.',
    example: 't.ex. "stort vardagsrum med öppet kök och trappa upp"',
    placeholder: 'Beskriv ett rum, möbler, en trappa…',
    send: 'Skicka',
    thinking: 'Tänker…',
    usingTool: 'Verktyg: {{tool}}',
    notConfigured: 'AI:n är inte konfigurerad än (ingen API-nyckel på servern).',
    failed: 'Något gick fel. Försök igen.',
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
  ai: {
    heading: 'Plixa AI',
    intro: 'Beskriv hvad der skal bygges — Plixa ændrer scenen live.',
    example: 'f.eks. "stor stue med åbent køkken og trappe opad"',
    placeholder: 'Beskriv et rum, møbler, en trappe…',
    send: 'Send',
    thinking: 'Tænker…',
    usingTool: 'Værktøj: {{tool}}',
    notConfigured: 'AI\'en er ikke konfigureret endnu (ingen API-nøgle på serveren).',
    failed: 'Noget gik galt. Prøv igen.',
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
  ai: {
    heading: 'Plixa AI',
    intro: 'Descrie ce să construiască — Plixa schimbă scena în timp real.',
    example: 'de ex. „living mare cu bucătărie deschisă și scară în sus"',
    placeholder: 'Descrie o cameră, mobilier, o scară…',
    send: 'Trimite',
    thinking: 'Se gândește…',
    usingTool: 'Instrument: {{tool}}',
    notConfigured: 'IA nu este încă configurată (nicio cheie API pe server).',
    failed: 'Ceva n-a mers. Încearcă din nou.',
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
