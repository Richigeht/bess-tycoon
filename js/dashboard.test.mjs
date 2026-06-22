import assert from 'node:assert/strict';
import { DASHBOARD_PANELS, DASHBOARD_SCENARIOS, scoreDashboard } from './dashboard.mjs';

const investor = DASHBOARD_SCENARIOS.find(s => s.id === 'investor-demo');
const good = DASHBOARD_PANELS.filter(p => investor.needs.includes(p.metric));
const bad = DASHBOARD_PANELS.filter(p => p.metric === 'production');

assert.equal(scoreDashboard(investor, good).passed, true);
assert.equal(scoreDashboard(investor, bad).passed, false);
assert.deepEqual(scoreDashboard(investor, bad).missing, ['money', 'soc']);

console.log('dashboard scoring ok');
