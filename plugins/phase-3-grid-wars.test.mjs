import assert from 'node:assert/strict';
import test from 'node:test';
import { loadClassicPlugin } from './test-plugin-loader.mjs';

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
  Plugin._tradeCount = 1;
  Plugin._solarFloodActive = true;
  const state = phase3State({ algorithmScore: 100, gridStability: 50 });
  state.achievements = [{ id: 'first_trade' }];
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
