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
