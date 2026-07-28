# Reliability Hardening and Warranty Claim Siege Design

## Goal

Fix the verified save, plugin lifecycle, dashboard, and Phase 3 defects, then introduce an interactive warranty-claims phase without adding dependencies or replacing the existing plugin architecture.

## Current Problems

The repository audit reproduced these user-facing failures:

- Autosave never reaches its ten-second interval because the timer is recreated after every one-second game tick.
- Version 2 saves bypass normalization, allowing malformed nested state to break the game and remain in local storage.
- Phase 2 and Phase 3 restore hooks run before saved progress makes those plugins eligible to load.
- Import does not load newly eligible plugins before restoring them.
- Disabling a plugin removes its hooks but leaves its resources, upgrades, events, and tabs active.
- Plugin dependency failures and failed initialization can crash loading or leave partial registrations behind.
- Disabled plugins and their durable state are not restored consistently.
- Dashboard challenges accept missing thresholds and can be submitted repeatedly for unlimited rewards.
- Phase 2 and Phase 3 treat legitimate zero values as missing values.
- Phase 3 can activate contradictory market events, lose money during a Solar Flood, omit crash prices from history, and retain the frequency-market multiplier while banned.
- The README advertises direct `file://` use even though module imports and plugin loading require a static server.

## Scope

### Reliability hardening

1. Normalize every loaded or imported save before it reaches React state.
2. Install one stable autosave timer that always serializes the latest state.
3. Load eligible plugins before dispatching their restore hooks.
4. Persist disabled plugin IDs and serialize durable state for registered plugins, including disabled ones.
5. Make plugin initialization and unloading atomic across hooks, resources, upgrades, events, tabs, and actions.
6. Validate dependencies, reject duplicate plugin IDs, and prevent dependents from loading without active dependencies.
7. Make dashboard challenge rewards one-time and require thresholds for every required panel.
8. Correct the verified Phase 2 and Phase 3 numeric and market-event defects.
9. Correct the README development instructions.

### New phase

Add `Phase 4: Warranty Claim Siege`, unlocked at 10,000 batteries and dependent on Phase 2. It introduces an interactive claim queue, customer trust, warranty decisions, and claim-management upgrades.

## Non-Goals

- No general modal, form-builder, or arbitrary plugin UI framework.
- No new runtime or test dependencies.
- No build pipeline or conversion of classic plugin scripts to bundled modules.
- No global-expansion mechanics from the older Phase 4 roadmap.
- No broad split of the existing React application.

## Architecture

### Save normalization and autosave

Create `js/save.mjs` with pure functions for normalizing and assembling save data. Every legacy and version 2 payload passes through the same normalizer.

The normalizer will:

- Require a plain object and a finite numeric `money` value.
- Merge `upgrades`, `metrics`, `resources`, `certifications`, `multipliers`, and `pluginData` over their default objects.
- Accept `events`, `achievements`, and `dashboard` only when they are arrays.
- Preserve finite timestamps and sanitize `pluginsDisabled` to a unique array of strings.
- Fill missing fields from `DEFAULT_GAME_STATE`.

`BESSTycoon` will keep the latest game state in a React ref. A single mount-time interval will autosave that ref every ten seconds, avoiding timer recreation and stale closures.

Local load and file import will share this order:

1. Parse and normalize the payload.
2. Restore `PluginRegistry.disabledPlugins`.
3. Load every eligible, enabled plugin against the normalized state.
4. Run registered plugin `onAfterLoad` hooks, including disabled and not-yet-unlocked plugins.
5. Commit normalized state to React and local storage.

Persistence hooks run for all registered plugins so disabled plugins keep their durable state across reload and later re-enabling. Runtime hooks remain limited to loaded plugins.

### Atomic plugin lifecycle

`GameEngine` will ownership-tag every plugin registration made during `init()`:

- hooks
- resources
- upgrades
- events
- tabs
- actions

One removal operation will delete everything owned by a plugin. It will run after normal cleanup, after throwing cleanup, and as rollback when initialization fails. Cleanup receives `gameEngine`, matching the documented contract.

Plugin registration will reject duplicate IDs. Dependency traversal will detect missing dependencies and cycles. Loading, dynamic loading, and manual enabling will all require registered, loaded, unlocked dependencies. A failed or locked dependency will skip its dependent without crashing unrelated plugins.

Phase 2 cleanup will stop erasing durable McKinsey progress. Phase 2 and Phase 3 restore hooks will reset their static fields to defaults before applying saved values with nullish fallbacks, so importing an older save cannot inherit state from the previous run.

### Interactive plugin actions

Add the smallest interaction surface needed by the warranty phase:

```javascript
gameEngine.addAction('warranty-honor', handler);
gameEngine.runAction('warranty-honor', gameState, { claimId });
```

Plugin tabs continue returning HTML. Interactive buttons use `data-game-action` and `data-claim-id`. The existing dynamic-tab wrapper handles clicks, finds the nearest action button, and passes its claim ID through `setGameState`.

Actions are ownership-tracked and disappear when their plugin unloads. Unknown actions, stale claim IDs, and thrown handlers leave state unchanged and log an error. Claim IDs are generated internally; no user-provided HTML is rendered.

This API is intentionally not a general event bus or UI component framework.

### Dashboard corrections

`scoreDashboard()` will pass only when every required metric is present and every required panel has a threshold.

Successful scenario IDs will be stored in `pluginData.dashboardClaims`. A pure dashboard-submission helper will guard against already-claimed scenarios and apply the reward; the React state updater will use that helper. The UI will disable completed scenarios. Failed attempts remain repeatable.

### Phase 2 and Phase 3 corrections

Numeric defaults where zero is valid will use nullish fallback rather than truthiness fallback. This applies especially to investor confidence, grid stability, algorithm score, and restored counters.

Phase 3 will also:

- Select at most one primary random market event per roll.
- Record price history after active-event overrides.
- Treat negative Solar Flood prices as paid charging revenue before degradation cost.
- Exclude the frequency-market multiplier while the player is banned.

The Phase 3 design document will be corrected to reference three Phase 2 grid-access tokens rather than three Phase 3 grid connections.

## Warranty Claim Siege

### State

Durable state lives in `pluginData.warranty`:

```javascript
{
  nextClaimId: 1,
  claims: [],
  filed: 0,
  honored: 0,
  denied: 0,
  vendorWins: 0,
  tick: 0
}
```

Each claim contains an internal numeric ID, a fixed cause label, payout, age, and a precomputed `vendorCovered` result. The hidden vendor result makes escalation a gamble without requiring non-deterministic action handlers.

The plugin adds `customerTrust`, starting at 70. The open-claim count is derived from the queue and shown in the phase tab rather than duplicated as another mutable resource.

### Claim creation

Every thirty ticks, the plugin rolls against a bounded risk:

- Base risk: 10%.
- Higher tech debt increases risk up to 40 percentage points.
- Skipped testing adds 15 percentage points.
- Ignored certifications add 20 percentage points.
- A root-cause lab halves the final risk.

New claims receive one of several fixed BESS failure causes and a payout based on production, capped at $50,000. Claims age each tick. An overdue backlog reduces customer trust at a fixed interval.

Customer trust affects production through the existing `calculateProduction` hook:

- Below 30 trust: production ×0.75.
- Above 80 trust: production ×1.05.
- Otherwise: no multiplier.

### Player decisions

Each claim card offers three accessible buttons:

1. **Honor claim**
   - Pay the adjusted claim amount.
   - Remove the claim.
   - Increase customer trust by 4.
   - Increment the honored count.

2. **Deny claim**
   - Remove the claim without a payout.
   - Reduce customer trust by 8.
   - Add 10 tech debt.
   - Reduce Phase 2 investor confidence by 5 when that resource exists.
   - Increment the denied count.

3. **Blame vendor**
   - When `vendorCovered` is true: remove the claim without payment and increase trust by 2.
   - Otherwise: pay 150% of the claim, reduce trust by 4, and reduce investor confidence by 3.
   - Increment the vendor-win count only on successful escalation.

Honor is disabled in the rendered tab when cash is insufficient, and the action handler repeats that validation.

### Upgrades

- **Hire RMA Specialist** — repeatable; each specialist reduces honored payouts by 10%, to a 50% floor.
- **Automated Claim Triage** — one-time; protects the first three queued claims from overdue trust penalties.
- **Root-Cause Analysis Lab** — one-time; halves new-claim risk.

The existing plugin-upgrade purchase path stores repeatable counts and one-time flags, so no second upgrade system is introduced.

### Presentation

The Warranty tab shows:

- customer trust and its production effect
- open, honored, denied, and vendor-covered totals
- current risk factors
- one card per claim with age, cause, payout, and the three decisions
- an empty state when no claims are open

The tab follows the existing inline plugin styling and remains usable on narrow screens.

## Error Handling

- Invalid local saves are reported and ignored without replacing the current state.
- Invalid imported saves show the existing import error message and are not persisted.
- One broken plugin cannot prevent unrelated plugins from loading.
- Failed initialization rolls back all partial registrations.
- Throwing cleanup still removes all owned registrations.
- Invalid warranty actions and stale claim IDs are no-ops.
- Claim trust values are clamped to 0–100.

## Testing

Use Node's built-in test runner and strict assertions.

- `js/save.test.mjs`
  - malformed version 2 nested state is normalized
  - legacy saves receive current defaults
  - invalid roots and non-finite money are rejected
  - disabled plugin IDs are sanitized

- `js/engine.test.mjs`
  - unload removes every owned registration
  - failed initialization rolls back
  - throwing cleanup still unloads
  - missing, locked, and cyclic dependencies do not crash unrelated plugins
  - duplicate IDs are rejected
  - actions execute only while their plugin is loaded

- `js/dashboard.test.mjs`
  - required panels with thresholds pass
  - missing thresholds fail
  - completed scenarios cannot issue a second reward

- `plugins/phase-2-scale-up.test.mjs`
  - zero investor confidence remains zero and applies the low-confidence multiplier
  - restore resets stale static state before applying saved state

- `plugins/phase-3-grid-wars.test.mjs`
  - zero grid stability is preserved
  - event ranges are mutually exclusive
  - Solar Flood trades produce charging revenue
  - crash prices enter history
  - frequency bans remove their multiplier
  - restore preserves zero values

- `plugins/phase-4-warranty.test.mjs`
  - deterministic risk creates a claim
  - each decision applies its exact money, trust, debt, and investor effects
  - RMA payout discounts stop at 50%
  - backlog penalties respect automated triage
  - warranty state survives save normalization

Final verification will run all tests, syntax checks for every non-JSX script, a JSX parse/build check with the already-installed Bun binary, and a local static-server smoke test. A headless Firefox render will be attempted again; if CDN loading remains unavailable, it will be reported separately rather than represented as passing.

## Acceptance Criteria

- The full Node test suite passes without new dependencies.
- A continuously changing game autosaves its latest state every ten seconds.
- Valid legacy and version 2 saves load without malformed nested state.
- Phase 2 and Phase 3 internal state survives reload and import.
- Disabling a plugin removes all of its runtime and UI registrations and remains disabled after reload.
- Plugin failures do not leave partial registrations or crash unrelated plugins.
- Dashboard rewards can be claimed once and require configured thresholds.
- The verified Phase 3 market defects are covered by regression tests.
- Warranty claims appear, persist, render, and resolve through all three choices.
- Warranty decisions affect cash, customer trust, tech debt, investor confidence, and production as specified.
- README instructions match the supported static-server workflow.
