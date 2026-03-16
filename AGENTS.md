# AGENTS.md — Coding Agent Guidelines for mezastar-helper

## Project Overview

Pokemon Mezastar battle helper — a vanilla TypeScript web app that recommends
Mezatags against enemy Pokemon based on type effectiveness. Deployed to GitHub
Pages via Vite. No framework (no React/Vue/Angular). Material Design 3 with
Forest color theme.

## Build / Test / Lint Commands

```bash
npm run dev            # Vite dev server (port 5173, auto-open)
npm run build          # Production build to dist/ (terser minify)
npm run test           # Vitest in watch mode
npx vitest run         # Run all tests once (no watch)
npm run test:coverage  # Tests with v8 coverage (80% threshold)
npm run lint           # ESLint on src/ and tests/
npm run format         # Prettier write on src/ and tests/
npm run crawl          # Run Mezatag crawler script (ts-node)
```

### Running a single test file

```bash
npx vitest run tests/domain/typeEffectiveness.spec.ts
```

### Running tests matching a pattern

```bash
npx vitest run -t "should return 2.0 for super effective"
```

### CI pipeline order

```bash
npm ci && npm run test && npm run build
```

## Architecture

```
src/
├── adapters/        # External data sources (Adapter pattern required by PRD)
│   └── bulbapediaAdapter.ts
├── domain/          # Pure business logic — no DOM, no side effects
│   ├── models.ts              # All shared interfaces and enums (single source of truth)
│   ├── typeEffectiveness.ts
│   ├── pokemonSearch.ts
│   ├── recommendationEngine.ts
│   └── trainerBattleEngine.ts
├── ui/              # Vanilla TS class-based UI components
│   ├── App.ts
│   ├── SearchComponent.ts
│   ├── RecommendationDisplay.ts
│   └── TrainerBattleComponent.ts
├── index.ts         # Entry point
└── styles.css       # MD3 Forest theme variables and resets

tests/               # Mirrors src/ structure
├── domain/          # Unit tests for domain logic
├── setup.ts         # Global test setup (clears mocks after each test)
└── adapters/, integration/, ui/, utils/  # Scaffolded, currently empty

data/                # Static data files committed to repo
├── type-matchups.json   # Numeric multiplier type chart (18 single types)
├── mezatags.json        # Crawled Mezatag data
└── SOURCES.md           # Tracks which Bulbapedia set pages have been crawled

public/data/         # Copy of data/ for Vite static serving — keep in sync
```

**Dependency chain**: `data/*.json` → `domain/typeEffectiveness.ts` →
`domain/recommendationEngine.ts` / `domain/trainerBattleEngine.ts` →
`ui/App.ts` → `ui/RecommendationDisplay.ts` / `ui/TrainerBattleComponent.ts`

## TypeScript & Formatting

- **Strict mode**: `strict: true` plus all individual strict flags enabled:
  `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `noUnusedLocals`,
  `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- **Target**: ES2020, **Module**: ESNext, bundler resolution
- **resolveJsonModule**: true — JSON imported directly into TS
- **Path aliases** (`@/*`, `@tests/*`) exist in tsconfig but are **not used** —
  all source code uses relative paths; follow that convention
- Prettier: semicolons, single quotes, trailing commas (es5), print width 100,
  tab width 2 (spaces), arrow parens always

### Imports

- External/library imports first, then internal/project imports
- Use relative paths (not `@/` aliases) — match existing convention
- Named imports only: `import { Foo, Bar } from './module'`
- CSS imports at top of entry point only

### Exports

- **Named exports only** — no default exports (except Vite/Vitest config files)
- Export functions with `export function` syntax (not `export const fn = ...`)
- Export classes with `export class` syntax

### Types and Interfaces

- **Prefer `interface` over `type`** for object shapes
- **No `I` prefix** on interfaces: `Pokemon`, not `IPokemon`
- Module-local types defined at top of file; shared types go in `models.ts`
- String enums: `PokemonType.Fire = 'Fire'`, `RecommendationType.ATTACK = 'attack'`
- Avoid `any` — use proper types or union types (`PokemonType | string`)
- Type assertions use `as` keyword (not angle brackets)

### Naming

| Element             | Convention         | Example                          |
| ------------------- | ------------------ | -------------------------------- |
| Domain files        | camelCase.ts       | `typeEffectiveness.ts`           |
| UI component files  | PascalCase.ts      | `SearchComponent.ts`             |
| Test files          | `<module>.spec.ts` | `typeEffectiveness.spec.ts`      |
| Functions           | camelCase          | `getOffensiveScore`              |
| Variables/constants | camelCase          | `offensiveScore`, `mockMezatags` |
| Interfaces          | PascalCase         | `ScoredMezatag`                  |
| Enums               | PascalCase         | `PokemonType`                    |
| Type aliases        | PascalCase         | `TypeMatchups`                   |
| CSS classes         | kebab-case         | `search-container`               |
| Directories         | lowercase          | `domain/`, `adapters/`           |

### Comments

- **Every file** starts with a `/** */` JSDoc block describing the module
- **Every exported function** has a `/** */` JSDoc comment (no `@param`/`@returns` tags)
- Private/internal helper functions also get JSDoc comments
- Inline `//` comments used sparingly for non-obvious logic
- Score formulas documented with mapping tables in comments
- Use [conventional commits standard](https://www.conventionalcommits.org/en/v1.0.0/)

### Error Handling

- Guard clauses with early returns for edge cases (empty arrays, missing data)
- Return sensible defaults: `1.0` for neutral scores, `[]` for empty results, `null` for missing data
- `try/catch` with `console.error()` + rethrow for critical failures
- `console.warn()` + fallback value for non-critical failures
- Philosophy: "continue with partial data" — skip bad entries, proceed with what works
- `no-console` ESLint rule allows `warn` and `error` but warns on `console.log`

## Testing Conventions

- Test runner: Vitest with jsdom environment
- File pattern: `tests/**/*.spec.ts` (not `.test.ts`)
- **Explicitly import** `{ describe, it, expect }` from `vitest` (despite globals: true)
- Import from source using relative paths: `../../src/domain/...`
- Mock data: typed `const` arrays at module scope
- Nested describes: outer = module name, inner = function name
- `it` descriptions: `'should ...'` convention
- Tests use real implementations (no module mocking)
- Test edge cases: empty arrays, invalid types, whitespace strings
- Coverage thresholds: 80% lines, functions, branches, statements

## Data Files

- `data/type-matchups.json`: Numeric multiplier structure.
  Outer key = attacking type, inner key = defending type, value = damage multiplier.
  Missing entries imply 1.0 (neutral). Immunities stored as 0.0.
  Only 18 single base types — dual-type effectiveness computed at runtime.
- `data/mezatags.json`: Crawled Mezatag data with names, types, stats, moves.
- `data/SOURCES.md`: Tracks which Bulbapedia set pages have been crawled.
  Update this file whenever new sets are added to `mezatags.json`.
- **Always keep `public/data/` in sync** with `data/` after any changes to JSON files.

## Key Design Decisions

- External data sources must use the **Adapter pattern** (PRD requirement)
- UI components are **class-based** with constructor receiving an `HTMLElement` container
- Dual-type effectiveness is **computed at runtime** by multiplying individual type multipliers
- Pokemon with missing data should be **filtered out**, not cause errors
- Mobile UI uses **collapsible sections** for long lists
- `Pokemon` interface has no `move` field — only `Mezatag` does. Trainer sequences
  must use `Mezatag[]` throughout, never `Pokemon[]`
- Trainer battle engine uses **greedy assignment** (Slot 3 → 1 → 4 → 2) and returns
  **top-3 ranked candidates per slot**; only rank-1 is removed from the pool
- Ties in all recommendation lists are broken by `energy` ascending (lower = preferred)
