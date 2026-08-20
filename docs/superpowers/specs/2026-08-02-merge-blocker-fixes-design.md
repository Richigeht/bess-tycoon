# PR #3 Merge-Blocker Fixes Design

**Goal:** Fix GitHub issues #4 and #5 on `feat/warranty-claim-siege` so PR #3 can proceed to final merge verification.

## Scope

- Stop `productionSpeed` modifiers from accumulating across game ticks.
- Prevent the Plugin Manager from offering Enable when a plugin's dependencies are not loaded.
- Add no dependencies and make no unrelated gameplay or UI changes.
- Work only in the existing `.worktrees/warranty-claims` linked worktree.

## Production Multiplier

`GameEngine.emit('calculateProduction', state)` is the shared entry point for every production calculation. It will reset `state.multipliers.productionSpeed` to the baseline value `1` before invoking registered hooks. Phase 2 and Warranty hooks can then multiply that fresh baseline during the current calculation without carrying their previous result into the next tick.

This also repairs previously saved inflated or reduced multiplier values on the first calculation after load. Individual plugins remain responsible only for their own factor.

## Plugin Eligibility

`PluginRegistry._canLoad()` already combines the unlock condition with loaded-dependency checks. It will become the public `PluginRegistry.canLoad()` method and remain the single eligibility rule used by initial loading, dynamic loading, manual enabling, and the Plugin Manager.

The Plugin Manager will show an unloaded plugin as Available and render Enable only when `canLoad()` returns true. If Phase 2 is disabled, Warranty Claim Siege will therefore unload recursively and appear Locked without an actionable Enable button.

## Error Handling

Existing initialization failure handling remains unchanged. The UI prevents known-ineligible enable attempts, while `PluginRegistry.enable()` retains its `false` return guard for callers outside the UI or state changes between rendering and clicking.

## Verification

- Add an engine regression test that runs production calculation twice and proves modifiers compose within a tick without compounding between ticks.
- Add an engine regression test that proves a dependent plugin is ineligible until its dependency is loaded.
- Run the complete Node test suite, JavaScript syntax checks, and the existing Bun JSX build check.
- Browser-smoke the Plugin Manager flow: disable Phase 2 at 10,000 or more batteries and verify Warranty is Locked with no Enable button.

## Delivery

Commit each issue fix separately on `feat/warranty-claim-siege`, push the branch, and link issues #4 and #5 from PR #3. Leave the draft PR unmerged until explicit merge authorization.
