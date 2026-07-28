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
