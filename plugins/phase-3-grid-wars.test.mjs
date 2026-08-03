import assert from 'node:assert/strict';
import test from 'node:test';
import { GameEngine, PluginRegistry } from '../js/engine.js';
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

test('frequency cooldown persists and restores deterministically', async () => {
  const Plugin = await loadClassicPlugin('./phase-3-grid-wars.js', 'Phase3GridWarsPlugin');
  Plugin._frequencyEventCooldown = 37;
  const saveData = {};
  Plugin.onBeforeSave(saveData);
  assert.equal(saveData.pluginData.phase3.frequencyEventCooldown, 37);
  Plugin.onAfterLoad({ pluginData: { phase3: { frequencyEventCooldown: 0 } } }, {});
  assert.equal(Plugin._frequencyEventCooldown, 0);
  Plugin._frequencyEventCooldown = 37;
  Plugin.onAfterLoad({ pluginData: {} }, {});
  assert.equal(Plugin._frequencyEventCooldown, 0);
});

test('unload preserves market progress for save and re-enable', async t => {
  const previous = {
    plugins: PluginRegistry.plugins,
    loadedPlugins: PluginRegistry.loadedPlugins,
    disabledPlugins: PluginRegistry.disabledPlugins,
  };
  PluginRegistry.plugins = new Map();
  PluginRegistry.loadedPlugins = [];
  PluginRegistry.disabledPlugins = new Set();
  t.after(() => Object.assign(PluginRegistry, previous));

  class Phase2Stub {
    static manifest = { id: 'phase-2-scale-up', name: 'Phase 2 Stub', version: '1' };
    static init() {}
  }
  const Plugin = await loadClassicPlugin('./phase-3-grid-wars.js', 'Phase3GridWarsPlugin');
  const engine = new GameEngine();
  const state = phase3State();
  PluginRegistry.register(Phase2Stub);
  PluginRegistry.register(Plugin);
  PluginRegistry.loadAll(engine, state);
  Plugin._tickCounter = 42;
  Plugin._priceHistory = [12, 34];

  PluginRegistry.disabledPlugins.add('phase-3-grid-wars');
  PluginRegistry.loadAll(engine, state);
  const saveData = {};
  PluginRegistry.triggerPersistenceHook('onBeforeSave', saveData);

  assert.equal(saveData.pluginData.phase3.tickCounter, 42);
  assert.deepEqual(Array.from(saveData.pluginData.phase3.priceHistory), [12, 34]);
  PluginRegistry.disabledPlugins.delete('phase-3-grid-wars');
  assert.equal(PluginRegistry.enable('phase-3-grid-wars', engine, state), true);
  assert.equal(Plugin._tickCounter, 42);
  assert.deepEqual(Array.from(Plugin._priceHistory), [12, 34]);
});

test('malformed Phase 3 containers and counters load as defaults and save safely', async () => {
  const Plugin = await loadClassicPlugin('./phase-3-grid-wars.js', 'Phase3GridWarsPlugin');
  const numericDefaults = {
    tickCounter: 0,
    currentPrice: 50,
    tradeCount: 0,
    profitableTradeCount: 0,
    totalTradeProfit: 0,
    consecutiveProfitDays: 0,
    dayProfitAccumulator: 0,
    dayTickCounter: 0,
    flashCrashTicks: 0,
    polarVortexStage: 0,
    polarVortexTicks: 0,
    solarFloodTicks: 0,
    firmwareBugTicks: 0,
    cyberBreachTicks: 0,
    frequencyEventCooldown: 0,
    frequencyMissStreak: 0,
    frequencyBanTicks: 0,
    totalFrequencyEvents: 0,
    fastFrequencyResponses: 0,
    batteryDegradation: 0,
    cycleCount: 0,
  };
  const malformed = {
    ...Object.fromEntries(Object.keys(numericDefaults).map(key => [key, Infinity])),
    priceHistory: {},
    connectedGrids: {},
    gridRelationships: [],
    riskTolerance: 0,
  };

  Plugin.onAfterLoad({ pluginData: { phase3: malformed } }, {});
  const saveData = {};
  assert.doesNotThrow(() => Plugin.onBeforeSave(saveData));

  const saved = saveData.pluginData.phase3;
  for (const [key, fallback] of Object.entries(numericDefaults)) assert.equal(saved[key], fallback, key);
  assert.equal(saved.riskTolerance, 0);
  assert.deepEqual(Array.from(saved.priceHistory), []);
  assert.deepEqual(Array.from(saved.connectedGrids), []);
  assert.deepEqual({ ...saved.gridRelationships }, { caiso: 0, pjm: 20, ercot: -10, miso: 0, nyiso: -5 });
});
