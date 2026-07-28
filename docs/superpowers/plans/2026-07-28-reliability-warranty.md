# Reliability Hardening and Warranty Claim Siege Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the verified save, plugin, dashboard, and Phase 3 defects and add an interactive Phase 4 warranty-claims plugin.

**Architecture:** Keep the static React application and classic plugin scripts. Add pure save and dashboard helpers for testable state transitions, make `GameEngine` plugin registration transactional and ownership-aware, expose one HTML action dispatcher for plugin tabs, and store all warranty claims in existing `pluginData`.

**Tech Stack:** Browser React 18/Babel, ES modules, classic browser plugin scripts, Node 24 built-in test runner, Node `vm`, Bun parser/build check.

## Global Constraints

- Add no runtime or test dependencies.
- Keep plugin scripts loadable as classic scripts from `plugins/manifest.json`.
- Use Node's built-in test runner and strict assertions.
- Preserve the existing one-second tick envelope and ten-second autosave interval.
- Runtime hooks run only for loaded plugins; persistence hooks run for every registered plugin.
- Warranty Claim Siege unlocks at 10,000 batteries and depends on `phase-2-scale-up`.
- Claim choices and numeric effects must match the approved design exactly.
- Keep unrelated `graphify-out/` changes out of task commits.

---

### Task 1: Normalize saves and make autosave stable

**Files:**
- Create: `js/save.mjs`
- Create: `js/save.test.mjs`
- Modify: `js/app.js:1-3`
- Modify: `js/app.js:180-359`

**Interfaces:**
- Produces: `normalizeSaveData(raw, defaults) -> normalizedState`
- Produces: `createSaveData(state, options) -> serializableSave`
- Produces: `startAutosave(getState, save, intervalMs, timers) -> stop()`
- Consumes: existing `DEFAULT_GAME_STATE`

- [ ] **Step 1: Write failing save-normalization and autosave tests**

Create `js/save.test.mjs` with Node tests covering malformed nested version 2 data, legacy defaults, invalid roots, disabled-plugin sanitization, and a stable timer reading the latest state:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import { createSaveData, normalizeSaveData, startAutosave } from './save.mjs';

const defaults = {
  money: 10000,
  batteries: 0,
  upgrades: { intern: 0, skipTesting: false },
  metrics: { temperature: 25, voltage: 48.2, soc: 87, alerts: 0 },
  resources: {},
  certifications: {},
  multipliers: { productionSpeed: 1, usSalesPrice: 1 },
  pluginData: {},
  events: [],
  achievements: [],
  dashboard: [],
};

test('normalizes malformed version 2 nested state', () => {
  const save = normalizeSaveData({
    version: '2.0',
    money: 500,
    batteries: 'many',
    upgrades: {},
    metrics: { temperature: 'hot' },
    resources: null,
    events: {},
    dashboard: {},
  }, defaults);
  assert.deepEqual(save.upgrades, defaults.upgrades);
  assert.deepEqual(save.metrics, defaults.metrics);
  assert.equal(save.batteries, 0);
  assert.deepEqual(save.resources, {});
  assert.deepEqual(save.events, []);
  assert.deepEqual(save.dashboard, []);
});

test('normalizes legacy saves with current defaults', () => {
  const save = normalizeSaveData({ money: 250, batteries: 9 }, defaults);
  assert.equal(save.version, '2.0');
  assert.equal(save.batteries, 9);
  assert.deepEqual(save.metrics, defaults.metrics);
});

test('rejects invalid save roots and non-finite money', () => {
  assert.throws(() => normalizeSaveData(null, defaults), /Invalid save file/);
  assert.throws(() => normalizeSaveData({ money: Infinity }, defaults), /Invalid save file/);
});

test('sanitizes disabled plugin ids', () => {
  const save = normalizeSaveData({
    money: 1,
    pluginsDisabled: ['phase-2-scale-up', 4, 'phase-2-scale-up', 'phase-3-grid-wars'],
  }, defaults);
  assert.deepEqual(save.pluginsDisabled, ['phase-2-scale-up', 'phase-3-grid-wars']);
});

test('createSaveData trims events and records plugin state', () => {
  const state = { ...defaults, events: Array.from({ length: 12 }, (_, i) => ({ text: `${i}` })) };
  const save = createSaveData(state, {
    loaded: ['phase-2-scale-up'],
    disabled: ['phase-3-grid-wars'],
    timestamp: 123,
  });
  assert.equal(save.events.length, 10);
  assert.equal(save.timestamp, 123);
  assert.deepEqual(save.pluginsLoaded, ['phase-2-scale-up']);
  assert.deepEqual(save.pluginsDisabled, ['phase-3-grid-wars']);
});

test('autosave reads current state from one stable timer', () => {
  let callback;
  let cleared;
  const timers = {
    setInterval(fn, ms) {
      callback = fn;
      assert.equal(ms, 10000);
      return 7;
    },
    clearInterval(id) {
      cleared = id;
    },
  };
  let state = { money: 1 };
  const saved = [];
  const stop = startAutosave(() => state, value => saved.push(value), 10000, timers);
  state = { money: 2 };
  callback();
  assert.deepEqual(saved, [{ money: 2 }]);
  stop();
  assert.equal(cleared, 7);
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
rtk node --test js/save.test.mjs
```

Expected: FAIL because `js/save.mjs` does not exist.

- [ ] **Step 3: Implement the pure save helpers**

Create `js/save.mjs` with these rules and signatures:

```javascript
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function normalizeKnownPrimitives(target, source, defaults) {
  for (const [key, fallback] of Object.entries(defaults)) {
    if (typeof fallback === 'number') {
      target[key] = Number.isFinite(source[key]) ? source[key] : fallback;
    } else if (typeof fallback === 'boolean') {
      target[key] = typeof source[key] === 'boolean' ? source[key] : fallback;
    }
  }
}

export function normalizeSaveData(raw, defaults) {
  if (!isRecord(raw) || !Number.isFinite(raw.money)) throw new Error('Invalid save file');
  const nested = ['upgrades', 'metrics', 'resources', 'certifications', 'multipliers', 'pluginData'];
  const normalized = { ...defaults, ...raw, version: '2.0' };
  normalizeKnownPrimitives(normalized, raw, defaults);
  for (const key of nested) {
    const source = isRecord(raw[key]) ? raw[key] : {};
    normalized[key] = {
      ...defaults[key],
      ...source,
    };
    normalizeKnownPrimitives(normalized[key], source, defaults[key]);
  }
  for (const key of ['events', 'achievements', 'dashboard']) {
    normalized[key] = Array.isArray(raw[key]) ? raw[key] : [...defaults[key]];
  }
  normalized.pluginsDisabled = [...new Set(
    (Array.isArray(raw.pluginsDisabled) ? raw.pluginsDisabled : []).filter(id => typeof id === 'string')
  )];
  normalized.timestamp = Number.isFinite(raw.timestamp) ? raw.timestamp : undefined;
  return normalized;
}

export function createSaveData(state, {
  loaded = [],
  disabled = [],
  timestamp = Date.now(),
} = {}) {
  return {
    ...state,
    events: state.events.slice(0, 10),
    version: '2.0',
    timestamp,
    pluginsLoaded: [...loaded],
    pluginsDisabled: [...disabled],
  };
}

export function startAutosave(getState, save, intervalMs = 10000, timers = globalThis) {
  const id = timers.setInterval(() => save(getState()), intervalMs);
  return () => timers.clearInterval(id);
}
```

- [ ] **Step 4: Run the helper tests and verify GREEN**

Run:

```bash
rtk node --test js/save.test.mjs
```

Expected: 6 tests pass.

- [ ] **Step 5: Wire normalization and the latest-state ref into the app**

Update the imports and React hooks:

```javascript
import { createSaveData, normalizeSaveData, startAutosave } from '/js/save.mjs';

const { useState, useEffect, useRef } = React;
```

Inside `BESSTycoon`, keep the latest state without adding another effect:

```javascript
const gameStateRef = useRef(gameState);
gameStateRef.current = gameState;
```

Replace `migrateSaveData()` calls with `normalizeSaveData(raw, DEFAULT_GAME_STATE)`. Build saves with `createSaveData()`. Make `saveGame` accept a state argument:

```javascript
const saveGame = (isAuto = false, state = gameStateRef.current) => {
  const saveData = createSaveData(state, {
    loaded: PluginRegistry.loadedPlugins.map(p => p.manifest.id),
    disabled: [...PluginRegistry.disabledPlugins],
  });
  // existing plugin persistence hook and localStorage handling remain here
};
```

Install one interval:

```javascript
useEffect(() => startAutosave(
  () => gameStateRef.current,
  state => saveGame(true, state),
), []);
```

Set `lastSave` only when `saveData.timestamp` is finite. Import must persist the normalized save rather than the raw payload.

- [ ] **Step 6: Run focused and baseline tests**

Run:

```bash
rtk node --test js/save.test.mjs js/dashboard.test.mjs
rtk bun build js/app.js --outdir /tmp/bess-task1 --external '/js/*'
```

Expected: all tests pass and Bun parses/builds the JSX.

- [ ] **Step 7: Commit Task 1**

```bash
rtk git add js/save.mjs js/save.test.mjs js/app.js
rtk git commit -m "fix: normalize saves and stabilize autosave"
```

---

### Task 2: Make plugin lifecycle atomic and add owned actions

**Files:**
- Create: `js/engine.test.mjs`
- Modify: `js/engine.js:3-195`
- Modify: `js/app.js:213-359`
- Modify: `js/app.js:1144-1151`
- Modify: `plugins/phase-2-scale-up.js:778-814`
- Modify: `plugins/phase-3-grid-wars.js:1015-1096`

**Interfaces:**
- Produces: `GameEngine.addAction(id, handler)`
- Produces: `GameEngine.runAction(id, state, payload) -> state`
- Produces: `GameEngine.removePlugin(pluginId)`
- Produces: `PluginRegistry.triggerPersistenceHook(hookName, ...args)`
- Changes: `PluginRegistry.enable(pluginId, gameEngine, gameState)`
- Consumes: `normalizeSaveData()` and `createSaveData()` from Task 1

- [ ] **Step 1: Write failing lifecycle tests**

Create `js/engine.test.mjs`. Reset registry statics before every test and define small plugins inline. Cover:

```javascript
import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';
import { GameEngine, PluginRegistry } from './engine.js';

beforeEach(() => {
  PluginRegistry.plugins.clear();
  PluginRegistry.loadedPlugins = [];
  PluginRegistry.disabledPlugins.clear();
  PluginRegistry._initializingPluginId = null;
});

test('unload removes every owned registration', () => {
  const engine = new GameEngine();
  class Plugin {
    static manifest = { id: 'owned', name: 'Owned', version: '1', dependencies: [], conflicts: [] };
    static init(e) {
      e.addResource({ id: 'resource' });
      e.addUpgrade({ id: 'upgrade' });
      e.addEvent({ id: 'event' });
      e.addTab({ id: 'tab' });
      e.addAction('action', state => state);
      e.on('tick', () => {});
    }
  }
  PluginRegistry.register(Plugin);
  PluginRegistry.loadAll(engine, {});
  PluginRegistry.unload('owned', engine);
  assert.deepEqual({
    resources: engine.resources.size,
    upgrades: [...engine.upgrades.values()].flat().length,
    events: engine.events.size,
    tabs: engine.tabs.size,
    actions: engine.actions.size,
    hooks: [...engine.hooks.values()].flat().length,
  }, { resources: 0, upgrades: 0, events: 0, tabs: 0, actions: 0, hooks: 0 });
});

test('failed initialization rolls back owned registrations', () => {
  const engine = new GameEngine();
  class Broken {
    static manifest = { id: 'broken', name: 'Broken', version: '1', dependencies: [], conflicts: [] };
    static init(e) {
      e.addResource({ id: 'partial' });
      e.on('tick', () => {});
      throw new Error('boom');
    }
  }
  PluginRegistry.register(Broken);
  PluginRegistry.loadAll(engine, {});
  assert.equal(engine.resources.size, 0);
  assert.equal([...engine.hooks.values()].flat().length, 0);
});

test('throwing cleanup still unloads and receives the engine', () => {
  const engine = new GameEngine();
  let received;
  class Plugin {
    static manifest = { id: 'cleanup', name: 'Cleanup', version: '1', dependencies: [], conflicts: [] };
    static init(e) { e.on('tick', () => {}); }
    static cleanup(e) { received = e; throw new Error('cleanup failed'); }
  }
  PluginRegistry.register(Plugin);
  PluginRegistry.loadAll(engine, {});
  PluginRegistry.unload('cleanup', engine);
  assert.equal(received, engine);
  assert.equal(PluginRegistry.loadedPlugins.length, 0);
  assert.equal([...engine.hooks.values()].flat().length, 0);
});

test('missing and cyclic dependencies do not block unrelated plugins', () => {
  const loaded = [];
  const make = (id, dependencies = []) => class {
    static manifest = { id, name: id, version: '1', dependencies, conflicts: [] };
    static init() { loaded.push(id); }
  };
  PluginRegistry.register(make('missing-child', ['absent']));
  PluginRegistry.register(make('cycle-a', ['cycle-b']));
  PluginRegistry.register(make('cycle-b', ['cycle-a']));
  PluginRegistry.register(make('healthy'));
  PluginRegistry.loadAll(new GameEngine(), {});
  assert.deepEqual(loaded, ['healthy']);
});

test('dependent plugin requires its dependency to be loaded', () => {
  const Dependency = class {
    static manifest = {
      id: 'dependency', name: 'Dependency', version: '1', dependencies: [], conflicts: [],
      unlockCondition: state => state.unlocked,
    };
    static init() {}
  };
  const Dependent = class {
    static manifest = { id: 'dependent', name: 'Dependent', version: '1', dependencies: ['dependency'], conflicts: [] };
    static init() {}
  };
  PluginRegistry.register(Dependency);
  PluginRegistry.register(Dependent);
  PluginRegistry.loadAll(new GameEngine(), { unlocked: false });
  assert.equal(PluginRegistry.loadedPlugins.length, 0);
});

test('duplicate ids are rejected', () => {
  class First { static manifest = { id: 'same', name: 'First', version: '1' }; static init() {} }
  class Second { static manifest = { id: 'same', name: 'Second', version: '2' }; static init() {} }
  assert.equal(PluginRegistry.register(First), true);
  assert.equal(PluginRegistry.register(Second), false);
  assert.equal(PluginRegistry.plugins.get('same'), First);
});

test('owned actions run only while the plugin is loaded', () => {
  const engine = new GameEngine();
  class Plugin {
    static manifest = { id: 'actions', name: 'Actions', version: '1', dependencies: [], conflicts: [] };
    static init(e) { e.addAction('increment', state => ({ ...state, value: state.value + 1 })); }
  }
  PluginRegistry.register(Plugin);
  PluginRegistry.loadAll(engine, {});
  assert.equal(engine.runAction('increment', { value: 1 }).value, 2);
  PluginRegistry.unload('actions', engine);
  assert.deepEqual(engine.runAction('increment', { value: 2 }), { value: 2 });
});
```

- [ ] **Step 2: Run lifecycle tests and verify RED**

Run:

```bash
rtk node --test js/engine.test.mjs
```

Expected: failures for retained registrations, missing `actions`, dependency crash, and duplicate overwrite.

- [ ] **Step 3: Implement owned registration and atomic cleanup**

Add `actions = new Map()` to `GameEngine`. Ownership-tag resource, upgrade, event, tab, action, and hook definitions using `PluginRegistry._initializingPluginId`.

Add:

```javascript
addAction(id, handler) {
  this.actions.set(id, {
    handler,
    _pluginOwner: PluginRegistry._initializingPluginId || null,
  });
}

runAction(id, state, payload = {}) {
  const action = this.actions.get(id);
  if (!action) return state;
  try {
    return action.handler(state, payload) ?? state;
  } catch (error) {
    console.error(`Action ${id} failed:`, error);
    return state;
  }
}

removePlugin(pluginId) {
  for (const [id, def] of this.resources) if (def._pluginOwner === pluginId) this.resources.delete(id);
  for (const [id, def] of this.events) if (def._pluginOwner === pluginId) this.events.delete(id);
  for (const [id, def] of this.tabs) if (def._pluginOwner === pluginId) this.tabs.delete(id);
  for (const [id, action] of this.actions) if (action._pluginOwner === pluginId) this.actions.delete(id);
  for (const [category, upgrades] of this.upgrades) {
    const remaining = upgrades.filter(def => def._pluginOwner !== pluginId);
    if (remaining.length) this.upgrades.set(category, remaining);
    else this.upgrades.delete(category);
  }
  this.off(pluginId);
}
```

Make `_initPlugin()` catch initialization errors, call `gameEngine.removePlugin(pluginId)`, then rethrow. Make `unload()` call `cleanup(gameEngine)` inside `try`, but always remove owned registrations and the loaded entry in `finally`.

- [ ] **Step 4: Enforce registration and dependency integrity**

Make `register()` return `false` for missing manifests, conflicts, and duplicate IDs; return `true` only when stored.

Implement DFS with `visiting`, `visited`, and `invalid` sets. Missing IDs and cycles mark the affected chain invalid while unrelated plugins remain in the returned order.

Use one `_canLoad(PluginClass, gameState)` check requiring:

```javascript
const dependencies = PluginClass.manifest.dependencies || [];
return (!PluginClass.manifest.unlockCondition || PluginClass.manifest.unlockCondition(gameState))
  && dependencies.every(id => this.loadedPlugins.includes(this.plugins.get(id)));
```

Use it from `loadAll`, `checkAndLoadNewPlugins`, and `enable(pluginId, gameEngine, gameState)`.

- [ ] **Step 5: Add persistence hooks for every registered plugin**

Add:

```javascript
static triggerPersistenceHook(hookName, ...args) {
  for (const PluginClass of this.plugins.values()) {
    if (typeof PluginClass[hookName] !== 'function') continue;
    try {
      PluginClass[hookName](...args);
    } catch (error) {
      console.error(`Error in ${PluginClass.manifest.id}.${hookName}:`, error);
    }
  }
}
```

In `js/app.js`:

- Pass `gameState` to manual `enable`.
- Use `triggerPersistenceHook('onBeforeSave', saveData)` for save and export.
- Restore `disabledPlugins` from normalized data before `loadAll`.
- Call `loadAll(gameEngine, newState)` before `triggerPersistenceHook('onAfterLoad', saveData, newState)` for both local load and import.

- [ ] **Step 6: Add dynamic-tab action delegation**

Wrap dynamic HTML tabs with an `onClick` handler:

```javascript
const handlePluginAction = event => {
  const button = event.target.closest('[data-game-action]');
  if (!button) return;
  setGameState(prev => gameEngine.runAction(button.dataset.gameAction, prev, {
    claimId: Number(button.dataset.claimId),
  }));
};
```

Render the existing `dangerouslySetInnerHTML` inside a `<div onClick={handlePluginAction}>`.

- [ ] **Step 7: Make Phase 2 and Phase 3 restore deterministic**

In both `onAfterLoad` methods, reset every static persisted field to its declared default before reading save data. Apply saved fields with `??`, not `||`.

Remove the Phase 2 cleanup assignments that erase `_mckinseyTimer` and `_mckinseyStage`; cleanup should only log and release external runtime work.

- [ ] **Step 8: Run focused tests and verify GREEN**

Run:

```bash
rtk node --test js/engine.test.mjs js/save.test.mjs
rtk node --check js/engine.js
rtk node --check plugins/phase-2-scale-up.js
rtk node --check plugins/phase-3-grid-wars.js
rtk bun build js/app.js --outdir /tmp/bess-task2 --external '/js/*'
```

Expected: all tests and checks pass.

- [ ] **Step 9: Commit Task 2**

```bash
rtk git add js/engine.js js/engine.test.mjs js/app.js plugins/phase-2-scale-up.js plugins/phase-3-grid-wars.js
rtk git commit -m "fix: make plugin lifecycle atomic"
```

---

### Task 3: Close dashboard scoring and reward exploits

**Files:**
- Modify: `js/dashboard.mjs:24-31`
- Modify: `js/dashboard.test.mjs:1-12`
- Modify: `js/app.js:563-584`
- Modify: `js/app.js:1000-1030`

**Interfaces:**
- Produces: `submitDashboardScenario(state, scenario, now) -> { state, result, rewarded }`
- Consumes: `scoreDashboard(scenario, panels)`

- [ ] **Step 1: Add failing dashboard regression tests**

Convert the existing assertion script to Node tests and add:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DASHBOARD_PANELS,
  DASHBOARD_SCENARIOS,
  scoreDashboard,
  submitDashboardScenario,
} from './dashboard.mjs';

const investor = DASHBOARD_SCENARIOS.find(s => s.id === 'investor-demo');
const good = DASHBOARD_PANELS.filter(p => investor.needs.includes(p.metric));

test('required panels with thresholds pass', () => {
  assert.equal(scoreDashboard(investor, good).passed, true);
});

test('required panels without thresholds fail', () => {
  const noThresholds = good.map(({ threshold, ...panel }) => panel);
  const result = scoreDashboard(investor, noThresholds);
  assert.equal(result.passed, false);
  assert.deepEqual(result.missingThresholds, investor.needs);
});

test('successful scenario rewards only once', () => {
  const initial = {
    money: 10000,
    techDebt: 10,
    dashboard: good,
    resources: { regulatoryCompliance: 0, investorConfidence: 50 },
    pluginData: {},
    events: [],
  };
  const first = submitDashboardScenario(initial, investor, 1);
  const second = submitDashboardScenario(first.state, investor, 2);
  assert.equal(first.rewarded, true);
  assert.equal(second.rewarded, false);
  assert.equal(second.state.money, 25000);
  assert.deepEqual(second.state.pluginData.dashboardClaims, ['investor-demo']);
});

test('failed scenarios remain repeatable and add debt', () => {
  const initial = {
    money: 10000,
    techDebt: 0,
    dashboard: good.slice(0, 1),
    resources: {},
    pluginData: {},
    events: [],
  };
  const first = submitDashboardScenario(initial, investor, 1);
  const second = submitDashboardScenario(first.state, investor, 2);
  assert.equal(first.rewarded, false);
  assert.equal(second.state.techDebt, 6);
});
```

- [ ] **Step 2: Run dashboard tests and verify RED**

Run:

```bash
rtk node --test js/dashboard.test.mjs
```

Expected: missing-threshold test fails and `submitDashboardScenario` is missing.

- [ ] **Step 3: Implement strict scoring and pure submission**

Update `scoreDashboard()` to calculate:

```javascript
const missingThresholds = scenario.needs.filter(metric => {
  const panel = panels.find(candidate => candidate.metric === metric);
  return panel && panel.threshold === undefined;
});
return {
  score,
  missing,
  missingThresholds,
  passed: score >= 75 && missing.length === 0 && missingThresholds.length === 0,
};
```

Add `submitDashboardScenario()` with these exact effects:

- Already claimed: return the same state and `rewarded: false`.
- Failed: add 3 tech debt and one failure event.
- Passed: add the scenario reward, subtract 5 tech debt to a floor of zero, add 15 compliance and 5 investor confidence when present, append the scenario ID to `pluginData.dashboardClaims`, and add one success event.
- Keep only ten events.

- [ ] **Step 4: Use the helper and disable claimed scenarios in React**

Replace the current `submitDashboard` updater with:

```javascript
const submitDashboard = scenario => {
  setGameState(prev => submitDashboardScenario(prev, scenario).state);
};
```

For each scenario, compute:

```javascript
const claimed = (gameState.pluginData.dashboardClaims || []).includes(scenario.id);
```

Disable its button when claimed and show `Completed` instead of the reward action label.

- [ ] **Step 5: Run focused and baseline verification**

Run:

```bash
rtk node --test js/dashboard.test.mjs js/save.test.mjs js/engine.test.mjs
rtk bun build js/app.js --outdir /tmp/bess-task3 --external '/js/*'
```

Expected: all tests pass and app JSX parses.

- [ ] **Step 6: Commit Task 3**

```bash
rtk git add js/dashboard.mjs js/dashboard.test.mjs js/app.js
rtk git commit -m "fix: close dashboard reward exploits"
```

---

### Task 4: Correct Phase 2 and Phase 3 simulation defects

**Files:**
- Create: `plugins/test-plugin-loader.mjs`
- Create: `plugins/phase-2-scale-up.test.mjs`
- Create: `plugins/phase-3-grid-wars.test.mjs`
- Modify: `plugins/phase-2-scale-up.js`
- Modify: `plugins/phase-3-grid-wars.js`
- Modify: `scrum-to-do/PHASE_3_GRID_WARS.md`

**Interfaces:**
- Produces: `loadClassicPlugin(file, className, random) -> PluginClass` test helper
- Changes: `Phase3GridWarsPlugin._getMarketMultiplier(pd)` observes `_frequencyBanned`

- [ ] **Step 1: Create the classic-plugin test loader**

Create:

```javascript
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

export async function loadClassicPlugin(file, className, random = () => 0.5) {
  const source = await readFile(new URL(file, import.meta.url), 'utf8');
  let registered;
  const math = Object.create(Math);
  math.random = random;
  const context = {
    console,
    Date,
    Math: math,
    PluginRegistry: { register(PluginClass) { registered = PluginClass; } },
  };
  vm.runInNewContext(`${source}\nglobalThis.__plugin = ${className};`, context);
  return registered || context.__plugin;
}
```

- [ ] **Step 2: Write failing Phase 2 tests**

Create `plugins/phase-2-scale-up.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import { GameEngine, PluginRegistry } from '../js/engine.js';
import { loadClassicPlugin } from './test-plugin-loader.mjs';

test('zero investor confidence applies the low-confidence multiplier', async () => {
  const Plugin = await loadClassicPlugin('./phase-2-scale-up.js', 'Phase2ScaleUpPlugin');
  const engine = new GameEngine();
  PluginRegistry._initializingPluginId = Plugin.manifest.id;
  Plugin.init(engine);
  PluginRegistry._initializingPluginId = null;
  const state = {
    batteries: 1000,
    batteriesPerSecond: 0,
    techDebt: 0,
    resources: { investorConfidence: 0, regulatoryCompliance: 0, lobbyingPoints: 0 },
    multipliers: { productionSpeed: 1 },
    pluginData: {},
    certifications: {},
    achievements: [],
    events: [],
    money: 0,
  };
  engine.emit('calculateProduction', state);
  assert.equal(state.multipliers.productionSpeed, 0.5);
});

test('restore resets stale static state and preserves saved zeroes', async () => {
  const Plugin = await loadClassicPlugin('./phase-2-scale-up.js', 'Phase2ScaleUpPlugin');
  Plugin._mckinseyTimer = 77;
  Plugin._auditsSurvived = 5;
  Plugin.onAfterLoad({ pluginData: { phase2: { mckinseyTimer: 0, auditsSurvived: 0 } } }, {});
  assert.equal(Plugin._mckinseyTimer, 0);
  assert.equal(Plugin._auditsSurvived, 0);
  Plugin._mckinseyTimer = 77;
  Plugin.onAfterLoad({ pluginData: {} }, {});
  assert.equal(Plugin._mckinseyTimer, 0);
});
```

- [ ] **Step 3: Write failing Phase 3 tests**

Create tests for:

```javascript
test('zero grid stability is not replaced with fifty', async () => {
  const Plugin = await loadClassicPlugin('./phase-3-grid-wars.js', 'Phase3GridWarsPlugin');
  const state = phase3State({ gridStability: 0 });
  Plugin.onTick(state, 1);
  assert.ok(state.resources.gridStability < 1);
});

test('solar flood produces paid charging revenue', async () => {
  const Plugin = await loadClassicPlugin('./phase-3-grid-wars.js', 'Phase3GridWarsPlugin');
  Plugin._connectedGrids = ['caiso'];
  Plugin._tickCounter = 4;
  Plugin._solarFloodActive = true;
  const state = phase3State({ algorithmScore: 100, gridStability: 50 });
  const before = state.money;
  Plugin.onTick(state, 1);
  assert.ok(state.money > before);
});

test('one market roll starts at most one primary event', async () => {
  const Plugin = await loadClassicPlugin('./phase-3-grid-wars.js', 'Phase3GridWarsPlugin', () => 0.996);
  Plugin._connectedGrids = ['caiso'];
  Plugin._tickCounter = 9;
  const state = phase3State({ gridStability: 50 });
  Plugin.onTick(state, 1);
  assert.equal(Plugin._polarVortexStage, 1);
  assert.equal(Plugin._solarFloodActive, false);
});

test('flash-crash prices are recorded after overrides', async () => {
  const Plugin = await loadClassicPlugin('./phase-3-grid-wars.js', 'Phase3GridWarsPlugin');
  Plugin._flashCrashActive = true;
  Plugin._flashCrashTicks = 0;
  Plugin.onTick(phase3State({ gridStability: 50 }), 1);
  assert.ok(Plugin._priceHistory.at(-1) < 10);
});

test('frequency ban removes the frequency multiplier', async () => {
  const Plugin = await loadClassicPlugin('./phase-3-grid-wars.js', 'Phase3GridWarsPlugin');
  Plugin._frequencyBanned = true;
  assert.equal(Plugin._getMarketMultiplier({ upgrade_market_frequency: true }), 1);
});

test('restore preserves zero-valued fields', async () => {
  const Plugin = await loadClassicPlugin('./phase-3-grid-wars.js', 'Phase3GridWarsPlugin');
  Plugin.onAfterLoad({ pluginData: { phase3: { currentPrice: 0, riskTolerance: 0 } } }, {});
  assert.equal(Plugin._currentPrice, 0);
  assert.equal(Plugin._riskTolerance, 0);
});
```

Define `phase3State(overrides)` in the test with all fields used by `onTick`: 100,000 batteries, three grid tokens, initialized Phase 3 resources, empty events/achievements, `pluginData`, certifications, multipliers, money, tech debt, upgrades, dashboard, and Phase 2 investor confidence.

Use this exact helper:

```javascript
const phase3State = (resourceOverrides = {}) => ({
  money: 1000000,
  batteries: 100000,
  batteriesPerSecond: 10,
  techDebt: 0,
  coffee: 0,
  clickPower: 1,
  upgrades: {
    intern: 0,
    autoAssembler: 0,
    skipTesting: false,
    alibabaOrder: false,
    ignoreCerts: false,
    grafanaLicense: false,
  },
  events: [],
  achievements: [],
  grafanaUnlocked: false,
  metrics: { temperature: 25, voltage: 48.2, soc: 87, alerts: 0 },
  resources: {
    gridAccessTokens: 3,
    investorConfidence: 50,
    mwhTraded: 0,
    frequencyCredits: 0,
    algorithmScore: 30,
    carbonCredits: 0,
    gridStability: 50,
    ...resourceOverrides,
  },
  certifications: {},
  multipliers: { productionSpeed: 1, usSalesPrice: 1 },
  pluginData: {},
  dashboard: [],
});
```

- [ ] **Step 4: Run Phase tests and verify RED**

Run:

```bash
rtk node --test plugins/phase-2-scale-up.test.mjs plugins/phase-3-grid-wars.test.mjs
```

Expected: failures for zero fallbacks, Solar Flood revenue, overlapping events, crash history, frequency ban, and zero restore.

- [ ] **Step 5: Fix Phase 2 zero fallbacks**

Replace investor-confidence defaults of `value || 50` with `value ?? 50` throughout Phase 2. Do not change fallbacks where zero and the fallback are behaviorally identical.

- [ ] **Step 6: Fix Phase 3 market behavior**

Make these minimal changes:

- Replace valid-zero defaults for investor confidence, grid stability, algorithm score, current price, risk tolerance, and persisted counters with `??`.
- Move `_priceHistory.push()` and its length cap to after all active and random market price overrides.
- Calculate paid charging before degradation:

```javascript
var priceSpread = this._currentPrice < 0
  ? Math.abs(this._currentPrice)
  : this._currentPrice * efficiency * 0.15;
```

- Convert Flash Crash, Polar Vortex, Solar Flood, Firmware Bug, Cyber Breach, and flavor selection to one `if / else if` chain using their existing numeric ranges.
- In `_getMarketMultiplier`, add frequency revenue only when `!this._frequencyBanned`.

- [ ] **Step 7: Correct the Phase 3 unlock documentation**

Change the design document unlock requirement from three connected grids to three Phase 2 grid-access tokens. Do not alter unrelated roadmap prose.

- [ ] **Step 8: Run Phase and full tests**

Run:

```bash
rtk node --test js/*.test.mjs plugins/*.test.mjs
rtk node --check plugins/phase-2-scale-up.js
rtk node --check plugins/phase-3-grid-wars.js
```

Expected: all tests and syntax checks pass.

- [ ] **Step 9: Commit Task 4**

```bash
rtk git add plugins/test-plugin-loader.mjs plugins/phase-2-scale-up.test.mjs plugins/phase-3-grid-wars.test.mjs plugins/phase-2-scale-up.js plugins/phase-3-grid-wars.js scrum-to-do/PHASE_3_GRID_WARS.md
rtk git commit -m "fix: correct scale-up and grid simulation"
```

---

### Task 5: Add Phase 4 Warranty Claim Siege

**Files:**
- Create: `plugins/phase-4-warranty.js`
- Create: `plugins/phase-4-warranty.test.mjs`
- Modify: `plugins/manifest.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: `GameEngine.addResource`, `addUpgrade`, `addTab`, `addAction`, and `on`
- Consumes: `pluginData.warranty`, `upgrade_count_warranty_rma`, `upgrade_warranty_triage`, `upgrade_warranty_lab`
- Produces actions: `warranty-honor`, `warranty-deny`, `warranty-vendor`

- [ ] **Step 1: Write failing warranty tests**

Create `plugins/phase-4-warranty.test.mjs` using `loadClassicPlugin`, `GameEngine`, and `PluginRegistry`. Provide a `warrantyState()` helper with 10,000 batteries, initialized arrays/objects, customer trust 70, and Phase 2 investor confidence 50.

Test these exact behaviors:

```javascript
test('deterministic risk files a claim', async () => {
  const { Plugin, state } = await setup(() => 0);
  for (let i = 0; i < 30; i++) Plugin.onTick(state, 1);
  assert.equal(state.pluginData.warranty.claims.length, 1);
  assert.equal(state.pluginData.warranty.filed, 1);
});

test('honoring a claim pays cash and adds four trust', async () => {
  const { engine, state } = await setup();
  state.pluginData.warranty.claims = [{ id: 1, cause: 'Cell imbalance', payout: 10000, age: 0, vendorCovered: false }];
  const next = engine.runAction('warranty-honor', state, { claimId: 1 });
  assert.equal(next.money, state.money - 10000);
  assert.equal(next.resources.customerTrust, 74);
  assert.equal(next.pluginData.warranty.honored, 1);
  assert.equal(next.pluginData.warranty.claims.length, 0);
});

test('denying a claim adds debt and damages trust and investors', async () => {
  const { engine, state } = await setup();
  state.pluginData.warranty.claims = [{ id: 1, cause: 'BMS reboot', payout: 10000, age: 0, vendorCovered: false }];
  const next = engine.runAction('warranty-deny', state, { claimId: 1 });
  assert.equal(next.money, state.money);
  assert.equal(next.techDebt, 10);
  assert.equal(next.resources.customerTrust, 62);
  assert.equal(next.resources.investorConfidence, 45);
  assert.equal(next.pluginData.warranty.denied, 1);
});

test('vendor escalation uses the precomputed result', async () => {
  const { engine, state } = await setup();
  state.pluginData.warranty.claims = [
    { id: 1, cause: 'Inverter fault', payout: 10000, age: 0, vendorCovered: true },
    { id: 2, cause: 'Thermal event', payout: 10000, age: 0, vendorCovered: false },
  ];
  const won = engine.runAction('warranty-vendor', state, { claimId: 1 });
  assert.equal(won.money, state.money);
  assert.equal(won.resources.customerTrust, 72);
  assert.equal(won.pluginData.warranty.vendorWins, 1);
  const lost = engine.runAction('warranty-vendor', won, { claimId: 2 });
  assert.equal(lost.money, state.money - 15000);
  assert.equal(lost.resources.customerTrust, 68);
  assert.equal(lost.resources.investorConfidence, 47);
});

test('RMA discounts stop at fifty percent', async () => {
  const { engine, state } = await setup();
  state.pluginData.upgrade_count_warranty_rma = 9;
  state.pluginData.warranty.claims = [{ id: 1, cause: 'Cell imbalance', payout: 10000, age: 0, vendorCovered: false }];
  const next = engine.runAction('warranty-honor', state, { claimId: 1 });
  assert.equal(next.money, state.money - 5000);
});

test('triage protects the first three overdue claims', async () => {
  const { Plugin, state } = await setup(() => 1);
  state.pluginData.upgrade_warranty_triage = true;
  state.pluginData.warranty.claims = Array.from({ length: 4 }, (_, index) => ({
    id: index + 1,
    cause: 'Field failure',
    payout: 5000,
    age: 59,
    vendorCovered: false,
  }));
  Plugin.onTick(state, 1);
  assert.equal(state.resources.customerTrust, 69);
});

test('low and high trust modify production', async () => {
  const { engine, state } = await setup();
  state.multipliers.productionSpeed = 1;
  state.resources.customerTrust = 20;
  engine.emit('calculateProduction', state);
  assert.equal(state.multipliers.productionSpeed, 0.75);
  state.multipliers.productionSpeed = 1;
  state.resources.customerTrust = 90;
  engine.emit('calculateProduction', state);
  assert.equal(state.multipliers.productionSpeed, 1.05);
});
```

`setup(random)` must reset registry state, load the classic plugin, register it, call `loadAll` with an unlocked state, and initialize missing plugin resources exactly as the app tick does.

Register this loaded dependency before the warranty plugin:

```javascript
const warrantyState = () => ({
  money: 1000000,
  batteries: 10000,
  batteriesPerSecond: 10,
  techDebt: 0,
  coffee: 0,
  clickPower: 1,
  upgrades: {
    intern: 0,
    autoAssembler: 0,
    skipTesting: false,
    alibabaOrder: false,
    ignoreCerts: false,
    grafanaLicense: false,
  },
  events: [],
  achievements: [],
  grafanaUnlocked: false,
  metrics: { temperature: 25, voltage: 48.2, soc: 87, alerts: 0 },
  resources: { investorConfidence: 50 },
  certifications: {},
  multipliers: { productionSpeed: 1, usSalesPrice: 1 },
  pluginData: {},
  dashboard: [],
});

class Phase2Stub {
  static manifest = {
    id: 'phase-2-scale-up',
    name: 'Phase 2 Stub',
    version: '1',
    dependencies: [],
    conflicts: [],
  };
  static init() {}
}

const setup = async (random = () => 0.5) => {
  PluginRegistry.plugins.clear();
  PluginRegistry.loadedPlugins = [];
  PluginRegistry.disabledPlugins.clear();
  const Plugin = await loadClassicPlugin('./phase-4-warranty.js', 'Phase4WarrantyPlugin', random);
  const engine = new GameEngine();
  const state = warrantyState();
  PluginRegistry.register(Phase2Stub);
  PluginRegistry.register(Plugin);
  PluginRegistry.loadAll(engine, state);
  for (const [id, def] of engine.resources) {
    if (state.resources[id] === undefined) state.resources[id] = def.startValue ?? 0;
  }
  return { Plugin, engine, state };
};
```

- [ ] **Step 2: Run warranty tests and verify RED**

Run:

```bash
rtk node --test plugins/phase-4-warranty.test.mjs
```

Expected: FAIL because the warranty plugin does not exist.

- [ ] **Step 3: Implement the manifest, resources, upgrades, and state**

Create `Phase4WarrantyPlugin` with:

```javascript
static manifest = {
  id: 'phase-4-warranty',
  name: 'Warranty Claim Siege',
  version: '1.0.0',
  author: 'BESS Tycoon Team',
  description: 'Field failures, customer claims, RMA decisions, and weaponized fine print.',
  unlockCondition: state => state.batteries >= 10000,
  unlockHint: 'Reach 10,000 batteries',
  dependencies: ['phase-2-scale-up'],
  conflicts: [],
};
```

Register `customerTrust` with start value 70 and display precision 0.

Register:

- repeatable `warranty_rma`, cost `$75,000`, incremented automatically through the existing repeatable-upgrade count
- one-time `warranty_triage`, cost `$250,000`
- one-time `warranty_lab`, cost `$750,000`

Each effect adds a short event; the one-time flags are applied by the existing purchase path.

Initialize warranty state lazily:

```javascript
static _data(state) {
  state.pluginData.warranty ??= {
    nextClaimId: 1,
    claims: [],
    filed: 0,
    honored: 0,
    denied: 0,
    vendorWins: 0,
    tick: 0,
  };
  return state.pluginData.warranty;
}
```

- [ ] **Step 4: Implement claim creation and trust effects**

On each tick:

1. Return before 10,000 batteries.
2. Increment `data.tick` and every claim age.
3. At each 60-tick age boundary, subtract one trust per overdue claim beyond the protected first three when triage is owned.
4. Every 30 ticks calculate:

```javascript
let risk = 0.10 + Math.min(0.40, state.techDebt / 1000);
if (state.upgrades.skipTesting) risk += 0.15;
if (state.upgrades.ignoreCerts) risk += 0.20;
if (state.pluginData.upgrade_warranty_lab) risk *= 0.5;
risk = Math.min(0.90, risk);
```

When the roll succeeds, add one claim. Select from:

```javascript
const causes = [
  'Cell imbalance',
  'BMS reboot loop',
  'Inverter fault',
  'Thermal event',
  'Capacity below warranty',
];
```

Calculate `payout = Math.min(50000, 5000 + Math.floor(state.batteriesPerSecond * 100))`, precompute `vendorCovered = Math.random() < 0.45`, increment IDs and `filed`, and add a claim event.

Clamp customer trust to 0–100. Register a `calculateProduction` hook with the approved 0.75 and 1.05 multipliers.

- [ ] **Step 5: Implement the three pure action transitions**

Every action must clone root state, `resources`, `pluginData`, warranty data, claim array, and events before changing them. A missing claim ID returns the original state.

Honor payout:

```javascript
const specialists = state.pluginData.upgrade_count_warranty_rma || 0;
const payoutMultiplier = Math.max(0.5, 1 - specialists * 0.1);
const payout = Math.round(claim.payout * payoutMultiplier);
```

If money is below payout, return unchanged state with one insufficient-cash event. Otherwise apply the exact approved honor effects.

Deny and vendor actions apply the exact values asserted in Step 1. Every resolved action removes the claim and adds a clear event.

- [ ] **Step 6: Render the interactive Warranty tab**

Register a `warranty` tab unlocked at 10,000 batteries. Return HTML containing:

- title and satirical subtitle
- customer trust, production effect, claim risk, open count, honored, denied, and vendor-win totals
- fixed upgrade guidance
- one responsive claim card per claim
- cause, age, and formatted payout
- three `<button>` elements carrying `data-game-action` and `data-claim-id`
- disabled Honor button when adjusted payout exceeds current money
- a clear empty state

Use only fixed internal cause strings and numeric values in HTML.

Each claim card must use this button contract:

```javascript
const claimCards = data.claims.map(claim => {
  const specialists = gameState.pluginData.upgrade_count_warranty_rma || 0;
  const adjustedPayout = Math.round(claim.payout * Math.max(0.5, 1 - specialists * 0.1));
  return '<article style="background:#1e293b;border:1px solid #475569;border-radius:8px;padding:16px">' +
    '<h3 style="color:white;margin:0 0 6px">Claim #' + claim.id + ': ' + claim.cause + '</h3>' +
    '<p style="color:#94a3b8">Age: ' + claim.age + ' ticks · Exposure: $' + adjustedPayout.toLocaleString() + '</p>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button data-game-action="warranty-honor" data-claim-id="' + claim.id + '"' +
        (gameState.money < adjustedPayout ? ' disabled' : '') + '>Honor claim</button>' +
      '<button data-game-action="warranty-deny" data-claim-id="' + claim.id + '">Deny claim</button>' +
      '<button data-game-action="warranty-vendor" data-claim-id="' + claim.id + '">Blame vendor</button>' +
    '</div>' +
  '</article>';
}).join('');
```

- [ ] **Step 7: Add the plugin to the manifest and README**

Append `"phase-4-warranty.js"` after Phase 3 in `plugins/manifest.json`.

Update README:

- Describe Warranty Claim Siege under implemented plugins.
- Replace direct-open instructions with static-server-only instructions.
- Mention interactive plugin actions in the Plugin API table.
- Keep the remaining future phases as planned work without calling Warranty Claim Siege unimplemented.

- [ ] **Step 8: Run warranty and full verification**

Run:

```bash
rtk node --test js/*.test.mjs plugins/*.test.mjs
rtk node --check plugins/phase-4-warranty.js
rtk node --check js/engine.js
rtk bun build js/app.js --outdir /tmp/bess-task5 --external '/js/*'
rtk proxy /home/sevenup/.local/share/uv/tools/graphifyy/bin/python -m json.tool plugins/manifest.json
```

Expected: all tests pass, scripts parse, JSX builds, and the manifest is valid JSON.

- [ ] **Step 9: Commit Task 5**

```bash
rtk git add plugins/phase-4-warranty.js plugins/phase-4-warranty.test.mjs plugins/manifest.json README.md
rtk git commit -m "feat: add interactive warranty claim phase"
```

---

### Task 6: Final integration verification and documentation consistency

**Files:**
- Modify only if verification exposes a defect in files already owned by Tasks 1–5.

**Interfaces:**
- Consumes: all prior task outputs
- Produces: verified repository state

- [ ] **Step 1: Run the complete automated suite**

```bash
rtk node --test js/*.test.mjs plugins/*.test.mjs
```

Expected: zero failures.

- [ ] **Step 2: Run every syntax and data check**

```bash
rtk node --check js/engine.js
rtk node --check js/dashboard.mjs
rtk node --check js/save.mjs
rtk node --check plugins/example-plugin.js
rtk node --check plugins/phase-2-scale-up.js
rtk node --check plugins/phase-3-grid-wars.js
rtk node --check plugins/phase-4-warranty.js
rtk proxy /home/sevenup/.local/share/uv/tools/graphifyy/bin/python -m json.tool plugins/manifest.json
rtk bun build js/app.js --outdir /tmp/bess-final-build --external '/js/*'
```

Expected: every command exits zero.

- [ ] **Step 3: Run the static-server smoke test**

Start:

```bash
rtk python3 -m http.server 8765
```

Then verify:

```bash
rtk curl -fsS http://127.0.0.1:8765/
rtk curl -fsS http://127.0.0.1:8765/plugins/manifest.json
rtk curl -fsS http://127.0.0.1:8765/plugins/phase-4-warranty.js
```

Expected: all assets return HTTP 200.

- [ ] **Step 4: Attempt the headless browser smoke test**

```bash
rtk firefox --headless --screenshot /tmp/bess-tycoon-final.png --window-size 1440,1000 http://127.0.0.1:8765/
```

Expected: screenshot exists and shows the game. If CDN loading remains unavailable after 60 seconds, terminate Firefox and record browser verification as environment-limited; do not claim it passed.

- [ ] **Step 5: Verify requirements and repository scope**

Re-read the design acceptance criteria and verify each against tests or runtime evidence. Run:

```bash
rtk git status --short
rtk git log --oneline 641d77e..HEAD
rtk git diff --check 641d77e..HEAD
```

Expected: only the known Graphify refresh remains outside committed implementation work, task commits are present, and the implementation diff has no whitespace errors.
