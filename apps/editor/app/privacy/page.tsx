import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung — Plixa Planer',
  description: 'Datenschutzerklärung des Plixa Planers (HERRMANN SARL).',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-border border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/"
            >
              Startseite
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/terms"
            >
              Nutzungsbedingungen
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="font-medium text-foreground">Datenschutz</span>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-12">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="mb-2 font-bold text-3xl">Datenschutzerklärung</h1>
          <p className="mb-8 text-muted-foreground text-sm">Stand: Juli 2026</p>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">1. Verantwortlicher</h2>
            <p className="text-foreground/90 leading-relaxed">
              Verantwortlich für die Datenverarbeitung im Sinne der Datenschutz-Grundverordnung
              (DSGVO) ist:
            </p>
            <p className="text-foreground/90 leading-relaxed">
              HERRMANN SARL
              <br />
              42 Rue d&apos;Emmersweiler
              <br />
              57600 Forbach
              <br />
              Frankreich
              <br />
              E-Mail:{' '}
              <a
                className="text-foreground underline hover:text-foreground/80"
                href="mailto:info@meisterbetrieb-herrmann.de"
              >
                info@meisterbetrieb-herrmann.de
              </a>
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">2. Überblick</h2>
            <p className="text-foreground/90 leading-relaxed">
              Der Plixa Planer ist ein Browser-Werkzeug zum Planen von Innenausbau und Grundrissen.
              Wir gehen sparsam mit Daten um: Deine Entwürfe bleiben grundsätzlich lokal in deinem
              Browser. Es gibt keine Konto-Pflicht, kein Tracking und keine Weitergabe deiner
              Entwürfe zu Werbezwecken. Diese Erklärung beschreibt, welche Daten bei der Nutzung
              tatsächlich anfallen.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">3. Welche Daten verarbeitet werden</h2>

            <h3 className="mt-4 font-medium text-lg">Lokale Speicherung im Browser</h3>
            <p className="text-foreground/90 leading-relaxed">
              Deine Szenen, Projekte und Einstellungen werden im lokalen Speicher deines Browsers
              (localStorage/IndexedDB) auf deinem Gerät abgelegt. Diese Daten verlassen dein Gerät
              nicht und werden nicht an uns übertragen, solange du sie nicht ausdrücklich speicherst
              oder teilst.
            </p>

            <h3 className="mt-4 font-medium text-lg">Möbel-Katalog (Cloudflare R2)</h3>
            <p className="text-foreground/90 leading-relaxed">
              Die 3D-Modelle und Vorschaubilder des Möbel-Katalogs werden aus unserem eigenen
              Objektspeicher bei Cloudflare R2 ausgeliefert. Beim Laden dieser Dateien wird technisch
              bedingt deine IP-Adresse an Cloudflare übermittelt, damit die Inhalte an deinen Browser
              gesendet werden können. Es werden dabei keine Katalog-Inhalte von Dritt-Servern (z. B.
              Supabase) mehr geladen.
            </p>

            <h3 className="mt-4 font-medium text-lg">Hosting</h3>
            <p className="text-foreground/90 leading-relaxed">
              Die Anwendung wird bei Vercel gehostet. Beim Aufruf werden zur Auslieferung und
              Absicherung technisch notwendige Server-Protokolldaten verarbeitet (u. a. IP-Adresse,
              Zeitpunkt, angefragte Ressource, Browsertyp).
            </p>

            <h3 className="mt-4 font-medium text-lg">Reichweitenmessung</h3>
            <p className="text-foreground/90 leading-relaxed">
              Standardmäßig findet keine Analyse deines Nutzungsverhaltens statt. Sofern für dieses
              Angebot Vercel Analytics bzw. Speed Insights aktiviert ist, werden lediglich
              anonymisierte, cookiefreie Kennzahlen (z. B. Seitenaufrufe, Ladezeiten) erhoben, die
              keinen Rückschluss auf deine Person zulassen.
            </p>

            <h3 className="mt-4 font-medium text-lg">KI-Assistenz</h3>
            <p className="text-foreground/90 leading-relaxed">
              Sofern die KI-Assistenz verfügbar ist und du sie aktiv nutzt, werden die von dir
              eingegebenen Texte sowie die zur Bearbeitung nötigen Szenendaten zur Verarbeitung an
              unseren KI-Dienstleister (Anthropic) übermittelt. Ohne aktive Nutzung dieser Funktion
              findet keine solche Übermittlung statt.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">4. Zwecke und Rechtsgrundlagen</h2>
            <p className="text-foreground/90 leading-relaxed">
              Wir verarbeiten Daten, um dir das Planungswerkzeug bereitzustellen (Art. 6 Abs. 1 lit.
              b DSGVO) und um den technischen Betrieb sicher und stabil zu halten (berechtigtes
              Interesse, Art. 6 Abs. 1 lit. f DSGVO). Die Nutzung der KI-Assistenz erfolgt auf Grund
              deiner aktiven Entscheidung, sie zu verwenden.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">5. Cookies</h2>
            <p className="text-foreground/90 leading-relaxed">
              Wir setzen keine Marketing- oder Tracking-Cookies ein. Technisch notwendige lokale
              Speichermechanismen dienen ausschließlich dazu, deine Entwürfe und Einstellungen im
              Browser zu behalten. Die optionale Reichweitenmessung (siehe oben) arbeitet ohne
              Cookies.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">6. Empfänger und Drittlandübermittlung</h2>
            <p className="text-foreground/90 leading-relaxed">
              Zur Bereitstellung des Dienstes setzen wir folgende Auftragsverarbeiter ein:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-foreground/90">
              <li>
                <strong>Vercel</strong> — Hosting und Auslieferung der Anwendung
              </li>
              <li>
                <strong>Cloudflare (R2)</strong> — Auslieferung der Katalog-Assets
              </li>
              <li>
                <strong>Anthropic</strong> — Verarbeitung von Eingaben, nur bei aktiver Nutzung der
                KI-Assistenz
              </li>
            </ul>
            <p className="mt-4 text-foreground/90 leading-relaxed">
              Dabei kann es zu einer Übermittlung in Länder außerhalb der EU/des EWR (u. a. USA)
              kommen. Diese ist durch geeignete Garantien (insbesondere EU-Standardvertragsklauseln)
              abgesichert. Jeder dieser Dienste unterliegt seiner eigenen Datenschutzerklärung.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">7. Speicherdauer</h2>
            <p className="text-foreground/90 leading-relaxed">
              Lokal gespeicherte Entwürfe verbleiben so lange auf deinem Gerät, bis du sie löschst
              oder den Browserspeicher leerst. Server-Protokolldaten werden nur so lange aufbewahrt,
              wie es für Betrieb und Sicherheit erforderlich ist.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">8. Deine Rechte</h2>
            <p className="text-foreground/90 leading-relaxed">Dir stehen folgende Rechte zu:</p>
            <ul className="list-disc space-y-2 pl-6 text-foreground/90">
              <li>Auskunft über die zu deiner Person verarbeiteten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-4 text-foreground/90 leading-relaxed">
              Zur Ausübung deiner Rechte genügt eine Nachricht an{' '}
              <a
                className="text-foreground underline hover:text-foreground/80"
                href="mailto:info@meisterbetrieb-herrmann.de"
              >
                info@meisterbetrieb-herrmann.de
              </a>
              . Zudem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">9. Änderungen dieser Erklärung</h2>
            <p className="text-foreground/90 leading-relaxed">
              Wir passen diese Datenschutzerklärung an, wenn sich die Datenverarbeitung ändert. Es
              gilt jeweils die auf dieser Seite veröffentlichte Fassung.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-xl">10. Kontakt</h2>
            <p className="text-foreground/90 leading-relaxed">
              Bei Fragen zum Datenschutz erreichst du uns unter{' '}
              <a
                className="text-foreground underline hover:text-foreground/80"
                href="mailto:info@meisterbetrieb-herrmann.de"
              >
                info@meisterbetrieb-herrmann.de
              </a>
              .
            </p>
          </section>
        </article>
      </main>
    </div>
  )
}
