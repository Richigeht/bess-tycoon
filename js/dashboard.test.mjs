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
