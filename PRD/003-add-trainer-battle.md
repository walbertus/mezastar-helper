# PRD 003 — Trainer Battle Team Recommender

## Overview

Add a **Trainer Battle** mode to Mezastar Helper. Given the fixed sequence of 4 trainer
Pokemon the user will face, the engine recommends the optimal 4-Pokemon team to deploy,
maximising score by KO-ing all trainer Pokemon while minimising total team energy cost.

---

## Background & Game Rules

### Battle structure

- The trainer deploys **3 Pokemon initially**; a 4th appears only after one of the trainer's
  Pokemon is KO'd.
- The player deploys **3 Pokemon initially** + keeps **1 reserve** off-field.
- Each turn: the trainer's active Pokemon attacks **all 3 of the player's deployed Pokemon
  simultaneously (AoE)**. Then **one** of the player's Pokemon attacks the trainer Pokemon.
- **Speed determines who attacks first.** If the trainer attacks first and KOs one of our
  Pokemon, that Pokemon loses its chance to attack that turn.
- The player can choose their own attack order freely.

### Scoring

- High score requires **KO-ing all 4 trainer Pokemon**.
- Score is further maximised by using the **lowest total energy** team possible.

---

## Feature Requirements

### Input

- User enters the **4 trainer Pokemon in battle order** (1 → 4) using the same
  name-search autocomplete as the existing Single Battle mode.
- The trainer Pokemon's attack type is sourced from `mezatags.json` (first matching tag's
  `move.type`), consistent with current enemy-search behaviour.

### Output

The engine returns a `TrainerBattleResult` containing 4 `TrainerBattleSlot` entries — one
per player Pokemon — with full scoring metadata and UI-ready flags.

---

## Slot Roles & Requirements

| Slot | Label            | Primary target | Survival requirement                                                                                                                                       | Notes                                                                               |
| ---- | ---------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1    | Frontliner       | Trainer #1     | **Must survive** Trainer #1's attack (defensiveScore ≥ 1.0 vs Trainer #1 move type). Hard filter — ineligible candidates are excluded.                     | Attacks Trainer #1                                                                  |
| 2    | Sacrifice        | Trainer #1     | **None.** Intentionally KO'd by Trainer #1's AoE. No defensive filter applied.                                                                             | Maximises offense vs Trainer #1 before dying. Replaced by the reserve.              |
| 3    | Anchor / Cleaner | Trainer #4     | **Informational only.** Shows per-trainer survival flags for Trainer #1, #2, and #3 but candidates are NOT filtered. Best available is always recommended. | Stays on field through the entire initial wave; primary role is killing Trainer #4. |
| 4    | Reserve          | Trainer #2     | **Must survive** Trainer #2's attack (defensiveScore ≥ 1.0 vs Trainer #2 move type). Hard filter.                                                          | Enters after Slot 2 is KO'd. Targets Trainer #2, then pressures #3 and #4.          |

---

## Algorithm

### Candidate scoring per slot

```
slotScore = offensiveScore(ourMezatag.move.type → trainerPokemon.types)
```

- Offensive score uses the existing `getOffensiveScore` function (raw damage multiplier).
- Ties broken by `energy` ascending (lower energy = preferred), consistent with project convention.

### Eligibility filters

- **Slot 1**: candidate must have `getDefensiveScore(mezatag.types, [trainer1.move.type]) >= 1.0`
- **Slot 2**: no filter
- **Slot 3**: no filter (survival info is computed and surfaced but does not gate selection)
- **Slot 4**: candidate must have `getDefensiveScore(mezatag.types, [trainer2.move.type]) >= 1.0`

If no eligible candidate exists for a filtered slot (Slot 1 or Slot 4), fall back to the
best available regardless of defensiveScore and set a `noEligibleCandidate: true` flag.

### Greedy assignment order

To avoid duplicate Mezatags in the team, assignment runs in priority order:

1. **Slot 3** (most constrained — must cover Trainer #4 and stay alive)
2. **Slot 1** (must survive Trainer #1)
3. **Slot 4** (must survive Trainer #2)
4. **Slot 2** (no constraint — takes best remaining)

Only the **rank-1 pick** per slot is removed from the pool. Alternative picks (rank 2 & 3)
do **not** deplete the pool, so the same Mezatag may appear as an alternative across multiple
slots.

### Top-3 recommendations per slot

Each slot returns **3 ranked candidates** instead of 1, giving the player visible alternatives.

- **Rank 1** — the primary (selected) pick. Used for `totalEnergy` calculation.
- **Rank 2 & 3** — alternatives drawn from the remaining sorted list (no defensive filter applied
  to alternatives; defensive filter only gates the rank-1 pick for Slots 1 and 4).
- `noEligibleCandidate` is only set on rank-1 (when the fallback is used). Ranks 2+ always
  set it to `false`.
- If the pool has fewer than 3 candidates for a slot, fewer recommendations are returned.

### Total energy

`totalEnergy = sum of rank-1 Mezatag energies across all 4 slots`

---

## Data Models

Added to `src/domain/models.ts`:

```ts
/** Per-trainer survival flag for a slot */
interface SlotSurvivalInfo {
  trainerPokemon: Mezatag;
  defensiveScore: number; // our mezatag's defensive score vs this trainer's move type
  canSurvive: boolean; // defensiveScore >= 1.0
}

/** A single ranked candidate within a slot's top-3 recommendations */
interface SlotRecommendation {
  rank: number; // 1 = best, 2 = second best, 3 = third best
  mezatag: Mezatag;
  offensiveScore: number; // vs trainerOpponent
  survivalInfo: SlotSurvivalInfo[]; // trainer Pokemon this slot is exposed to
  speedWarning: boolean; // our speed < trainerOpponent.speed
  noEligibleCandidate: boolean; // true only on rank-1 when fallback was used
}

/** One slot in the trainer battle recommendation */
interface TrainerBattleSlot {
  slotIndex: number; // 1–4
  isReserve: boolean; // true for slot 4
  isSacrifice: boolean; // true for slot 2
  trainerOpponent: Mezatag; // primary trainer Pokemon this slot targets
  recommendations: SlotRecommendation[]; // top 3 candidates, rank 1 is primary
}

/** Full trainer battle recommendation */
interface TrainerBattleResult {
  slots: TrainerBattleSlot[]; // exactly 4, in slot order
  totalEnergy: number; // sum of rank-1 Mezatag energies
}
```

---

## New Files

| File                                       | Purpose                                     |
| ------------------------------------------ | ------------------------------------------- |
| `src/domain/trainerBattleEngine.ts`        | Pure domain logic — no DOM, no side effects |
| `src/ui/TrainerBattleComponent.ts`         | 4-input search form + results display       |
| `tests/domain/trainerBattleEngine.spec.ts` | Unit tests for the engine                   |

## Modified Files

| File                   | Change                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| `src/domain/models.ts` | Add `SlotSurvivalInfo`, `TrainerBattleSlot`, `TrainerBattleResult` |
| `src/ui/App.ts`        | Add mode toggle: Single Battle / Trainer Battle                    |

---

## UI

- Mode tabs at the top: **Single Battle** | **Trainer Battle**
- Trainer Battle left panel: 4 labeled autocomplete search inputs (Trainer Pokemon 1–4)
- "Get Recommendation" button triggers the engine
- Right panel result cards (one per slot):
  - Slot badge: `SLOT 1`, `SLOT 2 SACRIFICE`, `SLOT 3 ANCHOR`, `SLOT 4 RESERVE`
  - Each slot shows **3 ranked rows** (`#1`, `#2`, `#3`); rank-1 is visually prominent
  - Per row: image, `Name(energy)`, move name + type, ATK score vs trainer opponent
  - Survival flags: per-trainer icon for each trainer this slot is exposed to
    - ✓ = can survive (defensiveScore ≥ 1.0)
    - ⚠ = at risk (defensiveScore < 1.0)
  - Speed warning if our Mezatag speed < trainer opponent speed
  - `noEligibleCandidate` warning (rank-1 only) if fallback was used
- Total energy displayed at the bottom of the results

---

## Assumptions

1. The trainer's attack type is taken from the first matching Mezatag entry in `mezatags.json`
   for that Pokemon name, same as the existing Single Battle mode.
2. "Survive" is defined purely by type-effectiveness proxy: `defensiveScore >= 1.0`.
   No actual HP damage simulation is performed.
3. Speed comparison is our Mezatag's `stats.speed` vs the trainer Pokemon's `stats.speed`
   (first matching Mezatag). It is informational only — no KO simulation is performed.
4. All 3 of our deployed Pokemon take AoE damage from the trainer's attack each turn.
5. Only one of our Pokemon attacks back per turn (player's choice).
6. The reserve (Slot 4) always replaces the sacrificed Slot 2 Pokemon.
7. Slot 3 is always the last standing from the initial 3 and is the primary cleaner for
   Trainer #4.
8. No duplicate Mezatags in the recommended team of 4.
9. If no candidate meets the defensive eligibility filter for Slot 1 or Slot 4,
   the engine falls back to the best offensive option and sets `noEligibleCandidate: true`.
