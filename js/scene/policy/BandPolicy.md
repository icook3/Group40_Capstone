# BandPolicy Interface (Design Doc – Phase 1)

A **BandPolicy** answers questions about *one* scenery band (lane). It contains no DOM logic.

## Required methods (constants for now; may become functions later)

- **mix(z)** → `{ tree: number, building: number }`
  - Probabilities sum to ~1.0 for the band at depth `z`.

- **xAnchor(kind, side)** → `number`
  - Lateral lane center for a `kind` ("tree" | "building") on `side` (-1 left, +1 right).

- **spacing(z)** → `number`
  - Target Z distance (meters) between spawns in this band.

- **density(z)** → `number`
  - Chance (0–1) to add a second object at the same Z.

- **jitterX(z)** → `number`
  - Max lateral randomization amplitude (meters) from the anchor.

- **zRange()** → `{ start: number, end: number }`
  - Spawn window in meters (e.g., `{ start: 10, end: -200 }`).

## Optional (future)
- **yOffset(kind, z)** → number
- **scale(kind, z)** → number
- **zJitter(z)** → number

## Notes
- Policies are **pure**: no side effects, no DOM.
- Values can be constants now; later they can vary with `z` or a seed.
- Each **band** gets its own policy. A Scene-level config will own an array of BandPolicies.
