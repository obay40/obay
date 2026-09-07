# Arbeitsvereinbarungen für Autoklick24

## Nach jeder Aufgabe: Kontroll-Link mitgeben

Am Ende **jeder** abgeschlossenen Aufgabe gehört ein Link in die Antwort,
mit dem der Auftraggeber das Ergebnis selbst prüfen kann:

**https://obay40.github.io/obay/**

Direkt auf den betroffenen Bereich verlinken, z. B.:
- Fahrzeugsuche → `https://obay40.github.io/obay/#/autos`
- Auto verkaufen → `https://obay40.github.io/obay/#/auto-verkaufen`

Bei hartnäckigem Browser-Cache einen Cache-Buster anhängen:
`https://obay40.github.io/obay/?v=3#/autos`

Vor dem Verlinken prüfen, dass die Änderung **live** angekommen ist (die
veröffentlichte Seite abrufen und den relevanten Inhalt darin nachweisen) —
nicht nur lokal oder im Branch.

## Zwei Oberflächen, zwei Branches

Änderungen an der Oberfläche müssen fast immer **beide** Stellen treffen,
sonst ist auf der Live-Seite nichts zu sehen:

| Was | Wo | Branch |
|---|---|---|
| Next.js-App (nicht deployed) | `apps/web/` | `claude/autoklick24-platform-architecture-0x26a9` |
| Veröffentlichte Demo-Seite | `index.html` (statisch) | `gh-pages` |

Nur `gh-pages` ist öffentlich erreichbar. Eine Suche über `apps/` und
`packages/` sagt daher **nichts** darüber aus, was auf der Live-Seite steht —
dafür muss `gh-pages` bzw. die ausgelieferte Seite geprüft werden.

## Vor dem Abschluss

`pnpm typecheck`, `pnpm lint`, `pnpm --filter @autoklick24/database test`,
`pnpm build` — und erst dann fertig melden.
