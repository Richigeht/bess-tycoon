export const DASHBOARD_PANELS = [
  { metric: 'temperature', title: 'Cell Temperature', unit: '°C', type: 'stat', threshold: 45, color: 'orange', source: gs => gs.metrics.temperature.toFixed(1) },
  { metric: 'voltage', title: 'System Voltage', unit: 'V', type: 'stat', threshold: 51, color: 'cyan', source: gs => gs.metrics.voltage.toFixed(2) },
  { metric: 'soc', title: 'State of Charge', unit: '%', type: 'gauge', threshold: 20, color: 'green', source: gs => gs.metrics.soc.toFixed(0) },
  { metric: 'alerts', title: 'Active Alerts', unit: '', type: 'stat', threshold: 1, color: 'red', source: gs => gs.metrics.alerts },
  { metric: 'production', title: 'Battery Production', unit: '/s', type: 'line', threshold: 1, color: 'blue', source: gs => gs.batteriesPerSecond.toFixed(1) },
  { metric: 'money', title: 'Revenue', unit: '$', type: 'stat', threshold: 50000, color: 'green', source: gs => Math.floor(gs.money).toLocaleString() },
];

export const DASHBOARD_SCENARIOS = [
  { id: 'investor-demo', name: 'Investor Demo', needs: ['production', 'money', 'soc'], reward: 15000 },
  { id: 'ul-audit', name: 'UL Audit', needs: ['temperature', 'voltage', 'alerts'], reward: 25000 },
  { id: 'grid-operator', name: 'Grid Operator Review', needs: ['soc', 'production', 'alerts'], reward: 35000 },
];

export const PANEL_COLOR_CLASSES = {
  orange: { border: 'border-orange-500/30', text: 'text-orange-400', bar: 'bg-orange-500' },
  cyan: { border: 'border-cyan-500/30', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  green: { border: 'border-green-500/30', text: 'text-green-400', bar: 'bg-green-500' },
  red: { border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' },
  blue: { border: 'border-blue-500/30', text: 'text-blue-400', bar: 'bg-blue-500' },
};

export function scoreDashboard(scenario, panels) {
  const metrics = new Set(panels.map(p => p.metric));
  const hits = scenario.needs.filter(metric => metrics.has(metric));
  const thresholdHits = panels.filter(p => scenario.needs.includes(p.metric) && p.threshold !== undefined).length;
  const score = Math.min(100, hits.length * 25 + thresholdHits * 8 + Math.min(10, panels.length));
  const missing = scenario.needs.filter(metric => !metrics.has(metric));
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
}

export function submitDashboardScenario(state, scenario, now = Date.now()) {
  const result = scoreDashboard(scenario, state.dashboard);
  const claims = state.pluginData.dashboardClaims || [];
  if (claims.includes(scenario.id)) return { state, result, rewarded: false };

  const event = {
    text: result.passed
      ? `📊 ${scenario.name} passed (${result.score}/100). Dashboard accepted.`
      : `📉 ${scenario.name} failed (${result.score}/100). Missing: ${result.missing.join(', ') || 'better thresholds'}.`,
    time: now,
  };
  if (!result.passed) {
    return {
      state: {
        ...state,
        techDebt: state.techDebt + 3,
        events: [event, ...state.events].slice(0, 10),
      },
      result,
      rewarded: false,
    };
  }

  const resources = { ...state.resources };
  if (resources.regulatoryCompliance !== undefined) resources.regulatoryCompliance += 15;
  if (resources.investorConfidence !== undefined) resources.investorConfidence += 5;
  return {
    state: {
      ...state,
      money: state.money + scenario.reward,
      techDebt: Math.max(0, state.techDebt - 5),
      resources,
      pluginData: { ...state.pluginData, dashboardClaims: [...claims, scenario.id] },
      events: [event, ...state.events].slice(0, 10),
    },
    result,
    rewarded: true,
  };
}
