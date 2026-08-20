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
