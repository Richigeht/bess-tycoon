import assert from 'node:assert/strict';
import test from 'node:test';
import { GameEngine, PluginRegistry } from '../js/engine.js';
import { loadClassicPlugin } from './test-plugin-loader.mjs';

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
  Plugin._data(state);
  return { Plugin, engine, state };
};

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
