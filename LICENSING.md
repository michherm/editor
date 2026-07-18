# Lizenzierung — Überblick (Dual-Lizenz)

Dieses Repository enthält zwei rechtlich getrennte Anteile:

| Anteil | Was | Lizenz | Rechteinhaber |
|---|---|---|---|
| **Open-Source-Kern** | `packages/*` (`@pascal-app/{core,viewer,editor,nodes,mcp}`), `node_modules` | **MIT** (siehe `/LICENSE`) bzw. jeweilige Paketlizenz | Pascal Group Inc. u. a. |
| **Plixa-Anteil** | `apps/editor/**`, `@plixa/*`-Pakete, als „© HERRMANN SARL" markierte Dateien, Geschäftsdaten (`lib/calc/**`) | **Proprietär** (siehe `apps/editor/LICENSE`) | HERRMANN SARL |

## Was das praktisch bedeutet

- Der **MIT-Kern** darf von jedermann genutzt, verändert und weitergegeben werden
  — das ist gewollt und lässt sich **nicht** einschränken. Der MIT-Vermerk in
  `/LICENSE` **muss erhalten bleiben** (sonst verletzt man selbst die MIT-Lizenz).
- Der **Plixa-Anteil** ist **proprietär**: keine Nutzung, Vervielfältigung,
  Bearbeitung, Dekompilierung, kein Scraping ohne schriftliche Genehmigung von
  HERRMANN SARL. Details in `apps/editor/LICENSE`.

## Abhängigkeits-Lizenzen (Stand der Prüfung)

Ein Scan der Abhängigkeiten ergab **keine** Copyleft-Lizenzen (GPL/AGPL/SSPL),
die zur Offenlegung eigenen Codes zwingen würden. Empfehlung: den Scan vor
Releases wiederholen, z. B.:

```
bunx license-checker-rseidelsohn --production --summary
bunx license-checker-rseidelsohn --production --onlyAllow "MIT;ISC;BSD-2-Clause;BSD-3-Clause;Apache-2.0;MPL-2.0;CC0-1.0;Unlicense"
```

Hinweis: MPL-2.0 kam vor — MPL ist „schwaches Copyleft" auf **Datei-Ebene** und
zwingt **nicht** zur Offenlegung deines eigenen Codes, solange du MPL-Dateien
nicht selbst veränderst und geschlossen weitergibst. Für die reine Nutzung als
Abhängigkeit unkritisch.
