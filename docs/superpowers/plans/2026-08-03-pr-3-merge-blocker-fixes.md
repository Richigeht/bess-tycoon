# PR #3 Merge-Blocker Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix GitHub issues #4 and #5 on `feat/warranty-claim-siege` so PR #3 can proceed to final merge verification.

**Architecture:** Reset the production multiplier at the existing shared `GameEngine.emit('calculateProduction', state)` boundary so all plugin factors compose from a fresh baseline each tick. Promote the existing registry eligibility check to public `PluginRegistry.canLoad()` and reuse it in the Plugin Manager instead of duplicating dependency logic in React.

**Tech Stack:** Browser React 18/Babel, ES modules, classic browser plugin scripts, Node 24 built-in test runner, Bun build parser.

## Global Constraints

- Stop `productionSpeed` modifiers from accumulating across game ticks.
- Prevent the Plugin Manager from offering Enable when a plugin's dependencies are not loaded.
- Add no dependencies and make no unrelated gameplay or UI changes.
- Work only in the existing `.worktrees/warranty-claims` linked worktree.
- Keep `PluginRegistry.enable()` returning `false` for ineligible callers.
- Leave draft PR #3 unmerged until explicit merge authorization.

## File Map

- Modify `js/engine.js`: reset the per-tick production baseline and expose the registry's shared plugin eligibility rule.
- Modify `js/engine.test.mjs`: cover repeated production calculations and dependency-aware eligibility.
- Modify `js/app.js`: use registry eligibility for Plugin Manager status and button visibility.

---

### Task 1: Reset production modifiers at the shared calculation boundary

**Files:**
- Modify: `js/engine.test.mjs`
- Modify: `js/engine.js:278-283`

**Interfaces:**
- Consumes: `GameEngine.on(hookName, callback)` and `GameEngine.emit(hookName, ...args)`.
- Produces: `GameEngine.emit('calculateProduction', state)` resets `state.multipliers.productionSpeed` to `1` before invoking hooks.

- [ ] **Step 1: Add the failing repeated-calculation regression test**

Append this test to `js/engine.test.mjs`:

```javascript
test('production calculations reset modifiers before every emission', () => {
  const engine = new GameEngine();
  engine.on('calculateProduction', state => {
    state.multipliers.productionSpeed *= 0.5;
  });
  engine.on('calculateProduction', state => {
    state.multipliers.productionSpeed *= 0.75;
  });
  const state = { multipliers: { productionSpeed: 8 } };

  engine.emit('calculateProduction', state);
  assert.equal(state.multipliers.productionSpeed, 0.375);

  engine.emit('calculateProduction', state);
  assert.equal(state.multipliers.productionSpeed, 0.375);
});
```

The initial value `8` represents an inflated value restored from an affected save. The two callbacks represent independent Phase 2 and Warranty factors.

- [ ] **Step 2: Run the engine suite and verify RED**

Run:

```bash
rtk node --test js/engine.test.mjs
```

Expected: FAIL in `production calculations reset modifiers before every emission`; the first result is `3`, proving the stale multiplier is carried into the calculation.

- [ ] **Step 3: Reset the multiplier before calculation hooks**

Change `GameEngine.emit()` in `js/engine.js` to:

```javascript
  emit(hookName, ...args) {
    if (hookName === 'calculateProduction') {
      args[0].multipliers.productionSpeed = 1;
    }
    const callbacks = this.hooks.get(hookName) || [];
    for (const callback of callbacks) {
      callback(...args);
    }
  }
```

Do not change the Phase 2 or Warranty hooks. They should continue multiplying the fresh baseline so their factors compose within the current tick.

- [ ] **Step 4: Run the engine and plugin production tests and verify GREEN**

Run:

```bash
rtk node --test js/engine.test.mjs plugins/phase-2-scale-up.test.mjs plugins/phase-4-warranty.test.mjs
```

Expected: PASS with zero failures. The new test proves repeated emissions remain `0.375`; the existing Phase 2 and Warranty multiplier expectations remain unchanged.

- [ ] **Step 5: Commit issue #4**

Run:

```bash
rtk git add js/engine.js js/engine.test.mjs
rtk git commit -m "fix: reset production multiplier each tick"
```

Expected: one commit containing only the shared reset and its regression test.

---

### Task 2: Use dependency-aware eligibility in the Plugin Manager

**Files:**
- Modify: `js/engine.test.mjs`
- Modify: `js/engine.js:44-157`
- Modify: `js/app.js:1053-1076`

**Interfaces:**
- Consumes: plugin manifests with `unlockCondition(state) -> boolean` and `dependencies: string[]`.
- Produces: `PluginRegistry.canLoad(PluginClass, gameState) -> boolean`.
- Produces: Plugin Manager status `Available` and button `Enable` only when `PluginRegistry.canLoad()` returns true.

- [ ] **Step 1: Add the failing public-eligibility regression test**

Append this test to `js/engine.test.mjs`:

```javascript
test('canLoad requires both unlock eligibility and loaded dependencies', () => {
  class Dependency {
    static manifest = { id: 'dependency', name: 'Dependency', version: '1' };
    static init() {}
  }
  class Dependent {
    static manifest = {
      id: 'dependent',
      name: 'Dependent',
      version: '1',
      dependencies: ['dependency'],
      unlockCondition: state => state.unlocked,
    };
    static init() {}
  }
  PluginRegistry.register(Dependency);
  PluginRegistry.register(Dependent);

  assert.equal(PluginRegistry.canLoad(Dependent, { unlocked: true }), false);
  PluginRegistry.loadedPlugins.push(Dependency);
  assert.equal(PluginRegistry.canLoad(Dependent, { unlocked: true }), true);
  assert.equal(PluginRegistry.canLoad(Dependent, { unlocked: false }), false);
});
```

- [ ] **Step 2: Run the engine suite and verify RED**

Run:

```bash
rtk node --test js/engine.test.mjs
```

Expected: FAIL with `TypeError: PluginRegistry.canLoad is not a function`.

- [ ] **Step 3: Make the existing eligibility method public and update registry callers**

In `js/engine.js`, rename:

```javascript
  static _canLoad(PluginClass, gameState) {
```

to:

```javascript
  static canLoad(PluginClass, gameState) {
```

In the same file, replace all four calls:

```javascript
this._canLoad(PluginClass, gameState)
```

with:

```javascript
this.canLoad(PluginClass, gameState)
```

These callers are `loadAll()` reconciliation, `loadAll()` loading, `checkAndLoadNewPlugins()`, and `enable()`. Keep the existing `enable()` guard:

```javascript
if (!this.canLoad(PluginClass, gameState)) return false;
```

- [ ] **Step 4: Route Plugin Manager status through the shared rule**

In `js/app.js`, replace:

```javascript
const canUnlock = manifest.unlockCondition ? manifest.unlockCondition(gameState) : true;
```

with:

```javascript
const canEnable = PluginRegistry.canLoad(plugin, gameState);
```

Then replace the three uses of `canUnlock` in the status class, status text, and button condition with `canEnable`:

```jsx
<div className={`px-2 py-1 rounded text-xs font-semibold ${isLoaded ? 'bg-green-900 text-green-400' : canEnable ? 'bg-yellow-900 text-yellow-400' : 'bg-slate-700 text-gray-400'}`}>
  {isLoaded ? 'Loaded' : canEnable ? 'Available' : 'Locked'}
</div>
{(isLoaded || canEnable) && (
  <button
    onClick={() => togglePlugin(manifest.id)}
    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${isLoaded ? 'bg-red-900/60 text-red-300 hover:bg-red-800' : 'bg-purple-900/60 text-purple-300 hover:bg-purple-800'}`}
  >
    {isLoaded ? 'Disable' : 'Enable'}
  </button>
)}
```

Do not add error state, notifications, or duplicate dependency checks to `togglePlugin()`.

- [ ] **Step 5: Run the engine suite and parse the JSX**

Run:

```bash
rtk node --test js/engine.test.mjs
rtk bun build js/app.js --outdir /tmp/bess-pr3-task2 --external '/js/*' --external 'react/jsx-dev-runtime'
```

Expected: the engine suite passes with zero failures and Bun completes without syntax or JSX errors.

- [ ] **Step 6: Commit issue #5**

Run:

```bash
rtk git add js/engine.js js/engine.test.mjs js/app.js
rtk git commit -m "fix: reflect plugin dependencies in manager"
```

Expected: one commit containing the public eligibility method, its regression test, and the Plugin Manager wiring.

---

### Task 3: Verify and hand off PR #3 without merging

**Files:**
- Verify: `js/engine.js`
- Verify: `js/app.js`
- Verify: `plugins/phase-2-scale-up.js`
- Verify: `plugins/phase-4-warranty.js`
- Verify: `plugins/manifest.json`

**Interfaces:**
- Consumes: the two issue-fix commits from Tasks 1 and 2.
- Produces: a clean, pushed `feat/warranty-claim-siege` branch with PR #3 linked to issues #4 and #5.

- [ ] **Step 1: Run the complete automated verification**

Run:

```bash
rtk node --test
rtk node --check js/engine.js
rtk node --check plugins/phase-2-scale-up.js
rtk node --check plugins/phase-3-grid-wars.js
rtk node --check plugins/phase-4-warranty.js
rtk bun build js/app.js --outdir /tmp/bess-pr3-merge-fixes --external '/js/*' --external 'react/jsx-dev-runtime'
```

Expected: every discovered Node test passes, every syntax check exits zero, and Bun completes without build errors.

- [ ] **Step 2: Browser-smoke the dependency UI**

From the worktree, start the existing static app:

```bash
rtk python3 -m http.server 8000
```

Open `http://127.0.0.1:8000`. In browser developer tools, seed the minimum valid unlocked save and reload:

```javascript
localStorage.setItem('bess-tycoon-save', JSON.stringify({
  money: 10000,
  batteries: 10000,
}));
location.reload();
```

In the Plugin Manager:

1. Confirm Phase 2 and Warranty Claim Siege show `Loaded`.
2. Click `Disable` for Phase 2.
3. Confirm Warranty Claim Siege changes to `Locked`.
4. Confirm Warranty Claim Siege has no `Enable` button.

Stop the static server with `Ctrl-C` after the check.

- [ ] **Step 3: Confirm the local branch contains only intended commits**

Run:

```bash
rtk git status --short
rtk git log --oneline origin/feat/warranty-claim-siege..HEAD
rtk git diff --stat origin/feat/warranty-claim-siege..HEAD
```

Expected: the worktree is clean; the range contains the design/plan documentation and the two focused issue-fix commits; no `graphify-out/` file appears in the diff.

- [ ] **Step 4: Push the existing PR branch**

Run:

```bash
rtk git push origin feat/warranty-claim-siege
```

Expected: `origin/feat/warranty-claim-siege` advances to the verified local HEAD. Do not merge or mark the draft ready in this step.

- [ ] **Step 5: Link the issues and report the merge gate**

Append this exact footer to the body of GitHub PR #3:

```markdown
Fixes #4
Fixes #5
```

Add a PR comment containing the final test/build results and the browser-smoke result. Verify issues #4 and #5 remain open until the PR merges, and leave PR #3 in draft state pending explicit merge authorization.
