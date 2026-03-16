# Mezastar Helper

A battle recommendation tool for **Pokémon Mezastar** — the Japanese arcade game.
Given the enemy Pokémon you are facing, it recommends which Mezatags to use based
on type effectiveness.

**Live app**: https://walbertus.github.io/mezastar-helper/

---

## Features

### Single Battle mode

Search for any enemy Pokémon and get ranked Mezatag recommendations sorted by:

- **Attack** — maximise offensive type effectiveness
- **Defense** — maximise survivability against the enemy's move
- **Balanced** — best combined score

### Trainer Battle mode

Enter the 4 trainer Pokémon in battle order and get a full 4-slot team recommendation:

| Slot | Role       | Target     | Survival filter                  |
| ---- | ---------- | ---------- | -------------------------------- |
| 1    | Frontliner | Trainer #1 | Must survive Trainer #1's move   |
| 2    | Sacrifice  | Trainer #1 | None — intentionally KO'd by AoE |
| 3    | Anchor     | Trainer #4 | Informational only               |
| 4    | Reserve    | Trainer #2 | Must survive Trainer #2's move   |

Each slot shows **3 ranked candidates** so you can pick an alternative if you don't
own the top recommendation. Total team energy is shown at the bottom.

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Install & run

```bash
npm install
npm run dev        # opens http://localhost:5173/mezastar-helper/
```

### Build for production

```bash
npm run build      # output in dist/
```

### Run tests

```bash
npx vitest run                                         # all tests once
npx vitest run tests/domain/trainerBattleEngine.spec.ts  # single file
npx vitest run -t "should return 2.0 for super effective"  # by name
npm run test:coverage                                  # with coverage report
```

---

## Project Structure

```
src/
├── adapters/               # External data sources (Bulbapedia crawler)
├── domain/                 # Pure business logic — no DOM
│   ├── models.ts           # All shared interfaces and enums
│   ├── typeEffectiveness.ts
│   ├── pokemonSearch.ts
│   ├── recommendationEngine.ts
│   └── trainerBattleEngine.ts
├── ui/                     # Vanilla TS class-based components
│   ├── App.ts
│   ├── SearchComponent.ts
│   ├── RecommendationDisplay.ts
│   └── TrainerBattleComponent.ts
├── index.ts                # Entry point
└── styles.css              # Material Design 3 Forest theme

data/
├── mezatags.json           # 210 Mezatag entries (Sets 1–3)
├── type-matchups.json      # 18-type damage multiplier chart
└── SOURCES.md              # Which Bulbapedia pages have been crawled

public/data/                # Mirror of data/ served by Vite
tests/                      # Vitest unit tests (mirrors src/ structure)
```

---

## How Type Effectiveness Works

Damage multipliers follow the standard Pokémon type chart:

| Multiplier | Meaning                                     |
| ---------- | ------------------------------------------- |
| 4.0        | Double super effective (dual-type weakness) |
| 2.0        | Super effective                             |
| 1.0        | Neutral                                     |
| 0.5        | Not very effective                          |
| 0.25       | Double resist                               |
| 0.0        | Immune                                      |

Dual-type effectiveness is computed at runtime by multiplying the two individual
type multipliers. The raw multipliers are stored in `data/type-matchups.json`.

Scores used in recommendations:

- **Offensive score** — damage multiplier of our Mezatag's move type against the enemy's type(s)
- **Defensive score** — inverse multiplier `1 / (enemy move type vs our type(s))`; ≥ 1.0 means neutral or better

Ties are always broken by **energy ascending** (lower energy = preferred).

---

## Mezatag Data

Mezatag data is sourced from [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Mezastar).
Currently **210 tags** from **Original Sets 1–3** are included.
See [`data/SOURCES.md`](data/SOURCES.md) for the full list of crawled and pending set pages.

### Adding new sets

1. Run the crawler for the target set page:
   ```bash
   npm run crawl
   ```
2. Verify the entries added to `data/mezatags.json`.
3. Copy the updated file to `public/data/mezatags.json` (must stay in sync).
4. Mark the set as crawled in `data/SOURCES.md`.

---

## Tech Stack

| Layer      | Choice                                       |
| ---------- | -------------------------------------------- |
| Language   | TypeScript (strict mode, ES2020)             |
| Bundler    | Vite                                         |
| Tests      | Vitest + jsdom                               |
| Styling    | Material Design 3 (Forest color theme)       |
| Deployment | GitHub Pages (auto-deploy on push to `main`) |
| Framework  | None — vanilla TypeScript                    |

---

## Development Notes

- All domain logic (`src/domain/`) is pure — no DOM, no side effects, fully unit-tested.
- UI components are class-based, receiving an `HTMLElement` container in their constructor.
- No `@/` path aliases in source — use relative imports throughout.
- `data/` and `public/data/` must always be kept in sync after any JSON changes.
- The pre-existing `bulbapediaAdapter.ts` has a known TypeScript error (missing `energy` field)
  that does not affect the build or tests.

## Contributing

1. Fork the repo and create a feature branch.
2. Run `npx vitest run` and `npm run build` — both must pass before committing.
3. Follow the [conventional commits](https://www.conventionalcommits.org/) format.
4. Open a pull request against `main`.
