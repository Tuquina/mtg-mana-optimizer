# mtg-mana-optimizer

Production-ready TypeScript monorepo for a Magic: The Gathering **Standard** deck optimizer focused on mana curve quality, land-count consistency, colored source targets, and deck adjustment recommendations.

## Monorepo structure

```text
apps/
  web/                     # Next.js UI
  api/                     # NestJS typed backend
packages/
  domain/                  # Core deck/card models + format validation
  deck-parser/             # Plain-text decklist parsing + seed catalog
  mana-curve-engine/       # Histogram, play-pattern curve, average MV
  probability-engine/      # Hypergeometric and consistency math
  simulation-engine/       # Baseline simulation adapters
  optimizer-engine/        # Land/source/cut-add recommendations
  shared/                  # Typed API contract + fixtures
```

## Architecture

This repository follows a clean, layered structure:

- **Domain-first modeling** (`packages/domain`) for `DeckCard`, `DeckList`, Standard constraints, and value objects.
- **Framework-agnostic math engines** (`packages/*-engine`) built as pure functions.
- **Adapters at the edge**:
  - `apps/api` orchestrates parse → validate → analyze → recommend.
  - `apps/web` consumes the backend via a **typed contract** from `packages/shared`.
- **Test split**:
  - Unit tests in core math/parser/recommendation packages.
  - API integration test with Nest testing + Supertest.

## Domain capabilities implemented

- Standard main deck validation (60-card minimum).
- Sideboard max 15 validation.
- Four-copy validation for non-basic cards.
- Deck card model includes:
  - `name`
  - `manaCost`
  - `manaValue`
  - `colors`
  - `colorPipRequirements`
  - `cardTypes`
  - `quantity`
  - `expectedCastTurn`
  - `expectedCastBucket`

## Analytics implemented

### Mana curve analysis

- Rules-based histogram by mana value buckets (`1..5`, `6+`).
- Effective play-pattern curve by expected cast bucket.
- Average nonland mana value.

### Probability analysis

- Hypergeometric PMF and cumulative-at-least functions.
- Land-drop consistency by turn (play/draw aware).
- Colored source consistency solver via minimum source search.

### First-pass recommendation engine

- Land count suggestion using baseline regression:
  - `lands ~= 16 + 3.14 * avg_nonland_mv`
- Colored source target suggestion (first-pass red source target for seeded deck).
- Flags for:
  - top-heavy curves
  - low early-game density
- Structured cut/add recommendations by curve bucket.

## Frontend features

The Next.js app includes:

- Decklist input box.
- Parsed deck preview panel.
- Mana curve panel.
- Land recommendation panel.
- Colored source analysis panel.
- Recommendations panel.

## API contract

- Request/response types live in `packages/shared/src/contracts/analysis-contract.ts`.
- Backend endpoint: `POST /analysis`.
- Frontend client in `apps/web/src/api.ts` returns typed `DeckAnalysisResponse`.

## Seed fixture

- `packages/shared/src/fixtures/sample-standard-deck.ts` ships with a sample Mono-Red Standard-style list for local testing.

## Workspace scripts

From repository root:

```bash
npm run dev          # web app
npm run dev:api      # API app
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:unit
npm run test:integration
npm run format
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run API:

```bash
npm run dev:api
```

3. Run web app in another terminal:

```bash
npm run dev
```

4. Open http://localhost:3000 and click **Analyze Deck**.

## Notes on current iteration

This initial version intentionally prioritizes **real domain boundaries and real math primitives** over exhaustive card-rules coverage. The engines are package-isolated and ready for extension with:

- richer card database ingestion,
- London mulligan Monte Carlo policies,
- untapped-source modeling for conditional lands,
- archetype-aware optimization objectives.
