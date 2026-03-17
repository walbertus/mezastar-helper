# AGENTS.md — Coding Agent Guidelines for mezastar-helper

## Project Overview

Pokemon Mezastar battle helper — a React + TypeScript SPA that recommends
Mezatags against enemy Pokemon based on type effectiveness. Deployed to GitHub
Pages via Vite. Stack: **Vite 7 + React 19 + React Router v7 (HashRouter) +
Tailwind v4 + shadcn/ui**. Material Design 3 Forest color theme via CSS variables.

## Build / Test / Lint Commands

```bash
npm run dev            # Vite dev server (port 5173)
npm run build          # Production build to dist/ (terser minify)
npm run preview        # Preview production build locally
npx vitest run         # Run all tests once (no watch)
npm run test           # Vitest in watch mode
npm run test:coverage  # Tests with v8 coverage (80% threshold)
npm run lint           # ESLint on src/ and tests/
npm run format         # Prettier write on src/ and tests/
npm run crawl          # Run Mezatag crawler script (ts-node)
```

### Running a single test file

```bash
npx vitest run tests/domain/typeEffectiveness.spec.ts
npx vitest run src/components/__tests__/SearchPanel.spec.tsx
```

### Running tests matching a pattern

```bash
npx vitest run -t "should return 2.0 for super effective"
```

### CI pipeline order

```bash
npm ci && npx vitest run && npm run build
```

### Installing packages

```bash
npm install --legacy-peer-deps   # always required due to peer dep conflicts
```

## Architecture

```
src/
├── components/          # React function components (PascalCase filenames)
│   ├── Header.tsx
│   ├── SingleBattleView.tsx
│   ├── TrainerBattleView.tsx
│   ├── SearchPanel.tsx
│   ├── RecommendationPanel.tsx
│   ├── TrainerBattleForm.tsx
│   ├── TrainerBattleResults.tsx
│   ├── __tests__/       # Component tests (co-located)
│   └── ui/              # shadcn/ui primitives (card, badge, button, input, skeleton)
├── domain/              # Pure business logic — no DOM, no side effects
│   ├── models.ts              # All shared interfaces and enums (single source of truth)
│   ├── typeEffectiveness.ts
│   ├── pokemonSearch.ts
│   ├── recommendationEngine.ts
│   └── trainerBattleEngine.ts
├── hooks/
│   └── useMezatags.ts   # Fetches mezatags.json at runtime
├── adapters/            # Adapter pattern (PRD requirement) — currently empty
├── App.tsx              # HashRouter + routes + layout shell
├── main.tsx             # React entry point, mounts to #app
└── styles.css           # @import 'tailwindcss' + MD3 CSS variables + resets

tests/
├── domain/              # Unit tests for domain logic
└── setup.ts             # afterEach mock cleanup (NOT wired into vitest.config.ts yet)

data/                    # Static data files committed to repo
├── type-matchups.json   # Bundled at build time via resolveJsonModule
├── mezatags.json        # Crawled Mezatag data (fetched at runtime)
└── SOURCES.md           # Tracks which Bulbapedia set pages have been crawled

public/data/             # Runtime-served copy — keep mezatags.json in sync with data/
scripts/                 # Standalone crawler/utility scripts (ts-node, not bundled)
```

**Dependency chain**: `data/*.json` → `domain/typeEffectiveness.ts` →
`domain/recommendationEngine.ts` / `domain/trainerBattleEngine.ts` →
`components/` views → `App.tsx`

## React & Component Conventions

- **Function components only** — no class components
- **Named exports only** — `export function Foo()`, never `export default`
- Props interfaces defined in the same file, named `<Component>Props`
- One component per file; filename matches the exported component name (PascalCase)
- Hooks in `src/hooks/`, one hook per file, named `use<Name>.ts`
- Use `useState` / `useEffect` — no external state management library
- Avoid `h-full` / `overflow-hidden` chains on cards — let the page scroll naturally
- Prefer inline `style` props over Tailwind for MD3 CSS variable colors to avoid
  specificity/purge issues (e.g. `style={{ color: 'var(--md-sys-color-primary)' }}`)

## Tailwind v4 Notes

- **No `tailwind.config.ts`** — configuration is done via `@tailwindcss/vite` plugin
- CSS entry point uses `@import 'tailwindcss'` (not `@tailwind base/components/utilities`)
- Do **not** add `* { margin: 0; padding: 0 }` resets — they override Tailwind spacing utilities
- The box-sizing reset `*, *::before, *::after { box-sizing: border-box }` is sufficient
- Radix UI `data-[state=active]` variant selectors are unreliable in Tailwind v4 —
  use `useState`-based switchers with inline styles instead

## TypeScript & Formatting

- **Strict mode**: `strict: true` plus all individual strict flags (see `tsconfig.json`)
- **Target**: ES2020, **Module**: ESNext, bundler resolution, `jsx: react-jsx`
- **resolveJsonModule**: true — JSON imported directly into TS
- Path aliases (`@/*`, `@tests/*`) exist in tsconfig and vitest config but are **not
  used** in source — all imports use relative paths; follow that convention
- Prettier: semicolons, single quotes, trailing commas (es5), print width 100,
  tab width 2, arrow parens always

### Imports

- External/library imports first, then internal/relative imports
- Use relative paths (not `@/` aliases) — match existing convention
- Named imports only: `import { Foo, Bar } from './module'`
- CSS imported only in `main.tsx`

### Exports

- **Named exports only** — no default exports (except Vite/Vitest config files)
- `export function Foo()` syntax (not `export const Foo = () =>`)

### Types and Interfaces

- **Prefer `interface` over `type`** for object shapes
- **No `I` prefix** on interfaces: `Pokemon`, not `IPokemon`
- Module-local types at top of file; shared types go in `domain/models.ts`
- String enums: `PokemonType.Fire = 'Fire'`, `RecommendationType.ATTACK = 'attack'`
- Avoid `any` — use proper types or union types
- Type assertions use `as` keyword (not angle brackets)

### Naming

| Element             | Convention         | Example                     |
| ------------------- | ------------------ | --------------------------- |
| Domain files        | camelCase.ts       | `typeEffectiveness.ts`      |
| Component files     | PascalCase.tsx     | `SearchPanel.tsx`           |
| Hook files          | camelCase.ts       | `useMezatags.ts`            |
| Test files          | `<module>.spec.ts` | `typeEffectiveness.spec.ts` |
| Functions/hooks     | camelCase          | `getOffensiveScore`         |
| Variables/constants | camelCase          | `offensiveScore`            |
| Interfaces          | PascalCase         | `ScoredMezatag`             |
| Enums               | PascalCase         | `PokemonType`               |
| CSS classes         | kebab-case         | `search-container`          |
| Directories         | lowercase          | `domain/`, `components/`    |

### Comments

- **Every file** starts with a `/** */` JSDoc block describing the module
- **Every exported function/component** has a `/** */` JSDoc comment
- Internal helper functions also get JSDoc comments
- Inline `//` comments used sparingly for non-obvious logic
- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)

### Error Handling

- Guard clauses with early returns for edge cases
- Return sensible defaults: `1.0` for neutral scores, `[]` for empty, `null` for missing
- `try/catch` with `console.error()` + rethrow for critical failures
- `console.warn()` + fallback for non-critical failures
- Philosophy: "continue with partial data" — skip bad entries, proceed with what works
- ESLint allows `console.warn` and `console.error`; warns on `console.log`

## Testing Conventions

- Test runner: Vitest with jsdom environment
- Domain tests: `tests/domain/*.spec.ts` — component tests: `src/components/__tests__/*.spec.tsx`
- **Explicitly import** `{ describe, it, expect }` from `vitest` (despite `globals: true`)
- Domain tests import from source with relative paths: `../../src/domain/...`
- Component tests use `@testing-library/react`
- Mock data: typed `const` arrays at module scope
- Nested describes: outer = module name, inner = function name
- `it` descriptions follow `'should ...'` convention
- Tests use real implementations (no module mocking)
- Test edge cases: empty arrays, invalid types, whitespace strings
- Coverage thresholds: 80% lines, functions, branches, statements

## Data Files

- `data/type-matchups.json`: Bundled at build time via `resolveJsonModule`. Outer key =
  attacking type, inner key = defending type, value = multiplier. Missing = 1.0 (neutral).
  Immunities = 0.0. 18 single types only — dual-type computed at runtime.
- `data/mezatags.json`: Fetched at runtime by `useMezatags`. Also copied to `public/data/`.
- `data/SOURCES.md`: Update whenever new sets are added to `mezatags.json`.
- **Always keep `public/data/mezatags.json` in sync with `data/mezatags.json`.**

## Key Design Decisions

- `Pokemon` has no `move` field — only `Mezatag` does. Trainer sequences must use
  `Mezatag[]` throughout, never `Pokemon[]`
- Dual-type effectiveness is **computed at runtime** by multiplying individual multipliers
- Trainer battle engine uses **greedy assignment** (Slot 3 → 1 → 4 → 2) and returns
  **top-3 ranked candidates per slot**; only rank-1 is removed from the pool
- Ties in all recommendation lists are broken by `energy` ascending (lower = preferred)
- Pokemon with missing data are **filtered out**, not treated as errors
- External data sources must use the **Adapter pattern** (`src/adapters/`)
- HashRouter is used for GitHub Pages compatibility (no server-side routing)
