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
  return { score, missing, passed: score >= 75 && missing.length === 0 };
}
