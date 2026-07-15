/**
 * Zusatz-Übersetzungen für die geführte Einführung (Hilfe) und die KI-Beispiel-
 * Prompts — in denselben 12 Sprachen wie die Haupt-App (de, en, fr, pl, it, es,
 * nl, pt, cs, sv, da, ro).
 *
 * Wird in `config.ts` per `addResourceBundle` (deep-merge) in den `translation`-
 * Namespace eingehängt: `welcome.*` kommt neu hinzu, `ai.starter.*` wird unter
 * das bestehende `ai`-Objekt gemischt, ohne `ai.heading/intro/example` zu
 * berühren. So bleiben die strengen `Translation`-Blöcke in `locales.ts`
 * unverändert.
 */

export type HelpBundle = {
  welcome: {
    title: string
    subtitle: string
    cta: string
    help: string
    s1: { title: string; body: string }
    s2: { title: string; body: string }
    s3: { title: string; body: string }
    s4: { title: string; body: string }
  }
  ai: {
    starter: { paint: string; brick: string; sofa: string; window: string; area: string }
  }
}

export const helpResources: Record<string, HelpBundle> = {
  de: {
    welcome: {
      title: 'Willkommen — so gestaltest du dein Haus',
      subtitle: 'Vier kurze Schritte. Diese Hilfe kannst du jederzeit über „?" unten wieder öffnen.',
      cta: "Los geht's",
      help: 'Hilfe',
      s1: { title: 'Dein Haus ist schon da', body: 'Du musst nichts neu bauen — du richtest es ein und gestaltest: Wände streichen, Möbel stellen, Fenster setzen.' },
      s2: { title: 'Am einfachsten: sag es der KI', body: 'Öffne den Chat und schreib, was du möchtest — z. B. „Streich die Wohnzimmerwand weiß", „Stell ein Sofa rein", „Setz ein Fenster in die Südwand". Die KI macht es für dich.' },
      s3: { title: 'Oder klick ein Element an', body: 'Wand oder Möbel anklicken = auswählen. Dann erscheinen Griffe zum Verschieben und Drehen; mit der Taste „P" trägst du ein Material auf.' },
      s4: { title: 'Fertig? Zurück zu Plixa', body: 'Oben rechts auf „Zurück zu Plixa" — deine Bearbeitung wird gespeichert und du kannst später weitermachen.' },
    },
    ai: { starter: {
      paint: 'Streich eine Innenwand hellblau.',
      brick: 'Mach eine Wand aus Backstein.',
      sofa: 'Stell ein Sofa in den größten Raum.',
      window: 'Schneide ein Fenster in die Südwand.',
      area: 'Wie viele Quadratmeter hat das Erdgeschoss?',
    } },
  },
  en: {
    welcome: {
      title: "Welcome — here's how to design your home",
      subtitle: 'Four quick steps. You can reopen this help any time via the "?" button below.',
      cta: "Let's go",
      help: 'Help',
      s1: { title: 'Your house is already here', body: 'Nothing to rebuild — you furnish and finish it: paint walls, place furniture, add windows.' },
      s2: { title: 'Easiest: just tell the AI', body: 'Open the chat and write what you want — e.g. "Paint the living-room wall white", "Add a sofa", "Put a window in the south wall". The AI does it for you.' },
      s3: { title: 'Or click an element', body: 'Click a wall or a piece of furniture to select it. Handles appear to move and rotate it; press "P" to apply a material.' },
      s4: { title: 'Done? Back to Plixa', body: 'Top right, "Back to Plixa" — your work is saved and you can continue later.' },
    },
    ai: { starter: {
      paint: 'Paint an interior wall light blue.',
      brick: 'Make a wall out of brick.',
      sofa: 'Put a sofa in the largest room.',
      window: 'Cut a window into the south wall.',
      area: 'How many square metres is the ground floor?',
    } },
  },
  fr: {
    welcome: {
      title: 'Bienvenue — voici comment aménager votre maison',
      subtitle: 'Quatre étapes rapides. Vous pouvez rouvrir cette aide à tout moment via le bouton « ? » en bas.',
      cta: "C'est parti",
      help: 'Aide',
      s1: { title: 'Votre maison est déjà là', body: "Rien à reconstruire — vous l'aménagez et la décorez : peindre les murs, placer des meubles, ajouter des fenêtres." },
      s2: { title: "Le plus simple : demandez à l'IA", body: "Ouvrez le chat et écrivez ce que vous voulez — p. ex. « Peins le mur du salon en blanc », « Ajoute un canapé », « Mets une fenêtre dans le mur sud ». L'IA le fait pour vous." },
      s3: { title: 'Ou cliquez sur un élément', body: "Cliquez sur un mur ou un meuble pour le sélectionner. Des poignées apparaissent pour le déplacer et le tourner ; appuyez sur « P » pour appliquer un matériau." },
      s4: { title: 'Terminé ? Retour à Plixa', body: "En haut à droite, « Retour à Plixa » — votre travail est enregistré et vous pourrez continuer plus tard." },
    },
    ai: { starter: {
      paint: 'Peins un mur intérieur en bleu clair.',
      brick: 'Fais un mur en brique.',
      sofa: 'Mets un canapé dans la plus grande pièce.',
      window: 'Perce une fenêtre dans le mur sud.',
      area: 'Combien de mètres carrés fait le rez-de-chaussée ?',
    } },
  },
  pl: {
    welcome: {
      title: 'Witaj — tak zaprojektujesz swój dom',
      subtitle: 'Cztery krótkie kroki. Tę pomoc możesz otworzyć ponownie w każdej chwili przyciskiem „?" na dole.',
      cta: 'Zaczynajmy',
      help: 'Pomoc',
      s1: { title: 'Twój dom już tu jest', body: 'Nic nie budujesz od nowa — urządzasz i wykańczasz: malujesz ściany, ustawiasz meble, dodajesz okna.' },
      s2: { title: 'Najprościej: powiedz SI', body: 'Otwórz czat i napisz, czego chcesz — np. „Pomaluj ścianę w salonie na biało", „Dodaj sofę", „Wstaw okno w południowej ścianie". SI zrobi to za Ciebie.' },
      s3: { title: 'Albo kliknij element', body: 'Kliknij ścianę lub mebel, aby zaznaczyć. Pojawią się uchwyty do przesuwania i obracania; naciśnij „P", aby nałożyć materiał.' },
      s4: { title: 'Gotowe? Powrót do Plixa', body: 'U góry po prawej „Powrót do Plixa" — Twoja praca jest zapisana i możesz kontynuować później.' },
    },
    ai: { starter: {
      paint: 'Pomaluj ścianę wewnętrzną na jasnoniebiesko.',
      brick: 'Zrób ścianę z cegły.',
      sofa: 'Ustaw sofę w największym pomieszczeniu.',
      window: 'Wytnij okno w południowej ścianie.',
      area: 'Ile metrów kwadratowych ma parter?',
    } },
  },
  it: {
    welcome: {
      title: 'Benvenuto — ecco come progettare la tua casa',
      subtitle: 'Quattro brevi passaggi. Puoi riaprire questa guida in qualsiasi momento con il pulsante « ? » in basso.',
      cta: 'Iniziamo',
      help: 'Aiuto',
      s1: { title: 'La tua casa è già qui', body: 'Niente da ricostruire — la arredi e la rifinisci: dipingi le pareti, posiziona i mobili, aggiungi finestre.' },
      s2: { title: "Il modo più semplice: chiedi all'IA", body: "Apri la chat e scrivi cosa vuoi — es. « Dipingi la parete del soggiorno di bianco », « Aggiungi un divano », « Metti una finestra nella parete sud ». L'IA lo fa per te." },
      s3: { title: 'Oppure clicca un elemento', body: 'Clicca una parete o un mobile per selezionarlo. Compaiono le maniglie per spostarlo e ruotarlo; premi « P » per applicare un materiale.' },
      s4: { title: 'Fatto? Torna a Plixa', body: 'In alto a destra, « Torna a Plixa » — il tuo lavoro viene salvato e puoi continuare più tardi.' },
    },
    ai: { starter: {
      paint: 'Dipingi una parete interna di azzurro.',
      brick: 'Fai una parete in mattoni.',
      sofa: 'Metti un divano nella stanza più grande.',
      window: 'Apri una finestra nella parete sud.',
      area: 'Quanti metri quadri ha il piano terra?',
    } },
  },
  es: {
    welcome: {
      title: 'Bienvenido — así diseñas tu casa',
      subtitle: 'Cuatro pasos rápidos. Puedes volver a abrir esta ayuda cuando quieras con el botón « ? » de abajo.',
      cta: 'Empezar',
      help: 'Ayuda',
      s1: { title: 'Tu casa ya está aquí', body: 'No hay que reconstruir nada — la amueblas y la decoras: pinta paredes, coloca muebles, añade ventanas.' },
      s2: { title: 'Lo más fácil: díselo a la IA', body: 'Abre el chat y escribe lo que quieras — p. ej. « Pinta la pared del salón de blanco », « Añade un sofá », « Pon una ventana en la pared sur ». La IA lo hace por ti.' },
      s3: { title: 'O haz clic en un elemento', body: 'Haz clic en una pared o un mueble para seleccionarlo. Aparecen tiradores para moverlo y girarlo; pulsa « P » para aplicar un material.' },
      s4: { title: '¿Listo? Volver a Plixa', body: 'Arriba a la derecha, « Volver a Plixa » — tu trabajo se guarda y puedes continuar más tarde.' },
    },
    ai: { starter: {
      paint: 'Pinta una pared interior de azul claro.',
      brick: 'Haz una pared de ladrillo.',
      sofa: 'Pon un sofá en la habitación más grande.',
      window: 'Abre una ventana en la pared sur.',
      area: '¿Cuántos metros cuadrados tiene la planta baja?',
    } },
  },
  nl: {
    welcome: {
      title: 'Welkom — zo ontwerp je je huis',
      subtitle: 'Vier korte stappen. Je kunt deze hulp altijd opnieuw openen via de knop „?" onderaan.',
      cta: 'Aan de slag',
      help: 'Hulp',
      s1: { title: 'Je huis staat er al', body: 'Niets opnieuw bouwen — je richt het in en werkt het af: muren verven, meubels plaatsen, ramen toevoegen.' },
      s2: { title: 'Het makkelijkst: zeg het tegen de AI', body: 'Open de chat en schrijf wat je wilt — bv. „Verf de woonkamermuur wit", „Zet er een bank in", „Plaats een raam in de zuidmuur". De AI doet het voor je.' },
      s3: { title: 'Of klik op een element', body: 'Klik op een muur of meubel om het te selecteren. Er verschijnen grepen om het te verplaatsen en draaien; druk op „P" om een materiaal toe te passen.' },
      s4: { title: 'Klaar? Terug naar Plixa', body: 'Rechtsboven „Terug naar Plixa" — je werk wordt opgeslagen en je kunt later verdergaan.' },
    },
    ai: { starter: {
      paint: 'Verf een binnenmuur lichtblauw.',
      brick: 'Maak een muur van baksteen.',
      sofa: 'Zet een bank in de grootste kamer.',
      window: 'Maak een raam in de zuidmuur.',
      area: 'Hoeveel vierkante meter is de begane grond?',
    } },
  },
  pt: {
    welcome: {
      title: 'Bem-vindo — veja como projetar a sua casa',
      subtitle: 'Quatro passos rápidos. Pode reabrir esta ajuda a qualquer momento no botão « ? » em baixo.',
      cta: 'Começar',
      help: 'Ajuda',
      s1: { title: 'A sua casa já está aqui', body: 'Nada para reconstruir — mobila e acaba: pintar paredes, colocar móveis, adicionar janelas.' },
      s2: { title: 'Mais fácil: peça à IA', body: 'Abra o chat e escreva o que quer — p. ex. « Pinta a parede da sala de branco », « Adiciona um sofá », « Põe uma janela na parede sul ». A IA faz por si.' },
      s3: { title: 'Ou clique num elemento', body: 'Clique numa parede ou móvel para selecionar. Surgem pegas para mover e rodar; prima « P » para aplicar um material.' },
      s4: { title: 'Pronto? Voltar ao Plixa', body: 'No canto superior direito, « Voltar ao Plixa » — o seu trabalho é guardado e pode continuar mais tarde.' },
    },
    ai: { starter: {
      paint: 'Pinta uma parede interior de azul-claro.',
      brick: 'Faz uma parede de tijolo.',
      sofa: 'Põe um sofá na maior divisão.',
      window: 'Abre uma janela na parede sul.',
      area: 'Quantos metros quadrados tem o rés-do-chão?',
    } },
  },
  cs: {
    welcome: {
      title: 'Vítejte — takto navrhnete svůj dům',
      subtitle: 'Čtyři krátké kroky. Tuto nápovědu můžete kdykoli znovu otevřít tlačítkem „?" dole.',
      cta: 'Jdeme na to',
      help: 'Nápověda',
      s1: { title: 'Váš dům už je tady', body: 'Nic nestavíte znovu — zařizujete a dokončujete: malujete stěny, umísťujete nábytek, přidáváte okna.' },
      s2: { title: 'Nejjednodušší: řekněte to AI', body: 'Otevřete chat a napište, co chcete — např. „Vymaluj stěnu v obýváku na bílo", „Přidej pohovku", „Udělej okno do jižní stěny". AI to udělá za vás.' },
      s3: { title: 'Nebo klikněte na prvek', body: 'Kliknutím na stěnu nebo nábytek je vyberete. Objeví se úchyty pro posun a otáčení; stiskem „P" nanesete materiál.' },
      s4: { title: 'Hotovo? Zpět do Plixy', body: 'Vpravo nahoře „Zpět do Plixy" — vaše práce se uloží a můžete pokračovat později.' },
    },
    ai: { starter: {
      paint: 'Vymaluj vnitřní stěnu světle modře.',
      brick: 'Udělej stěnu z cihel.',
      sofa: 'Dej pohovku do největší místnosti.',
      window: 'Vyřízni okno do jižní stěny.',
      area: 'Kolik metrů čtverečních má přízemí?',
    } },
  },
  sv: {
    welcome: {
      title: 'Välkommen — så inreder du ditt hus',
      subtitle: 'Fyra korta steg. Du kan öppna hjälpen igen när som helst via „?"-knappen nedan.',
      cta: 'Sätt igång',
      help: 'Hjälp',
      s1: { title: 'Ditt hus finns redan här', body: 'Inget att bygga om — du inreder och färdigställer: måla väggar, placera möbler, lägg till fönster.' },
      s2: { title: 'Enklast: säg det till AI:n', body: 'Öppna chatten och skriv vad du vill — t.ex. „Måla vardagsrumsväggen vit", „Sätt in en soffa", „Gör ett fönster i södra väggen". AI:n gör det åt dig.' },
      s3: { title: 'Eller klicka på ett element', body: 'Klicka på en vägg eller möbel för att markera. Handtag visas för att flytta och rotera; tryck „P" för att lägga på material.' },
      s4: { title: 'Klar? Tillbaka till Plixa', body: 'Uppe till höger „Tillbaka till Plixa" — ditt arbete sparas och du kan fortsätta senare.' },
    },
    ai: { starter: {
      paint: 'Måla en innervägg ljusblå.',
      brick: 'Gör en vägg av tegel.',
      sofa: 'Ställ en soffa i det största rummet.',
      window: 'Ta upp ett fönster i södra väggen.',
      area: 'Hur många kvadratmeter är bottenvåningen?',
    } },
  },
  da: {
    welcome: {
      title: 'Velkommen — sådan indretter du dit hus',
      subtitle: 'Fire korte trin. Du kan altid åbne hjælpen igen via „?"-knappen nederst.',
      cta: 'Kom i gang',
      help: 'Hjælp',
      s1: { title: 'Dit hus står her allerede', body: 'Intet at bygge om — du indretter og færdiggør: mal vægge, placer møbler, tilføj vinduer.' },
      s2: { title: 'Nemmest: sig det til AI\'en', body: 'Åbn chatten og skriv, hvad du vil — f.eks. „Mal stuevæggen hvid", „Sæt en sofa ind", „Lav et vindue i sydvæggen". AI\'en gør det for dig.' },
      s3: { title: 'Eller klik på et element', body: 'Klik på en væg eller et møbel for at vælge det. Der vises håndtag til at flytte og dreje; tryk „P" for at påføre et materiale.' },
      s4: { title: 'Færdig? Tilbage til Plixa', body: 'Øverst til højre „Tilbage til Plixa" — dit arbejde gemmes, og du kan fortsætte senere.' },
    },
    ai: { starter: {
      paint: 'Mal en indervæg lyseblå.',
      brick: 'Lav en væg af mursten.',
      sofa: 'Sæt en sofa i det største rum.',
      window: 'Lav et vindue i sydvæggen.',
      area: 'Hvor mange kvadratmeter er stueetagen?',
    } },
  },
  ro: {
    welcome: {
      title: 'Bine ai venit — iată cum îți amenajezi casa',
      subtitle: 'Patru pași scurți. Poți redeschide acest ajutor oricând cu butonul „?" de jos.',
      cta: 'Să începem',
      help: 'Ajutor',
      s1: { title: 'Casa ta este deja aici', body: 'Nimic de reconstruit — o mobilezi și o finisezi: vopsești pereți, adaugi mobilă, pui ferestre.' },
      s2: { title: 'Cel mai simplu: spune-i AI-ului', body: 'Deschide chatul și scrie ce vrei — de ex. „Vopsește peretele din living în alb", „Adaugă o canapea", „Pune o fereastră în peretele sudic". AI-ul o face pentru tine.' },
      s3: { title: 'Sau dă clic pe un element', body: 'Dă clic pe un perete sau o mobilă pentru a-l selecta. Apar mânere pentru mutare și rotire; apasă „P" pentru a aplica un material.' },
      s4: { title: 'Gata? Înapoi la Plixa', body: 'Sus în dreapta, „Înapoi la Plixa" — lucrul tău este salvat și poți continua mai târziu.' },
    },
    ai: { starter: {
      paint: 'Vopsește un perete interior în bleu.',
      brick: 'Fă un perete din cărămidă.',
      sofa: 'Pune o canapea în cea mai mare cameră.',
      window: 'Taie o fereastră în peretele sudic.',
      area: 'Câți metri pătrați are parterul?',
    } },
  },
}
