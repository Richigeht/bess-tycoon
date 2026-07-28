// === Plugin System ===

export class PluginRegistry {
  static plugins = new Map();
  static loadedPlugins = [];
  static disabledPlugins = new Set(); // player-disabled; not auto-reloaded
  static _initializingPluginId = null;

  // Run a plugin's init() with hook-ownership tracking enabled so that
  // any gameEngine.on() calls made during init are tagged for later removal.
  static _initPlugin(PluginClass, gameEngine) {
    this._initializingPluginId = PluginClass.manifest.id;
    try {
      PluginClass.init(gameEngine);
    } catch (error) {
      gameEngine.removePlugin(PluginClass.manifest.id);
      throw error;
    } finally {
      this._initializingPluginId = null;
    }
  }

  static register(PluginClass) {
    const manifest = PluginClass.manifest;
    if (!manifest || !manifest.id) {
      console.error('Plugin missing required manifest.id');
      return false;
    }
    if (this.plugins.has(manifest.id)) {
      console.warn(`Plugin already registered: ${manifest.id}`);
      return false;
    }
    for (const [id, existing] of this.plugins) {
      if (manifest.conflicts?.includes(id) || existing.manifest.conflicts?.includes(manifest.id)) {
        console.warn(`Plugin conflict: ${manifest.id} conflicts with ${id}`);
        return false;
      }
    }
    this.plugins.set(manifest.id, PluginClass);
    console.log(`Registered plugin: ${manifest.name} v${manifest.version}`);
    return true;
  }

  static loadAll(gameEngine, gameState) {
    for (const PluginClass of [...this.loadedPlugins]) {
      if (!this.loadedPlugins.includes(PluginClass)) continue;
      const pluginId = PluginClass.manifest.id;
      if (this.disabledPlugins.has(pluginId)) this.unload(pluginId, gameEngine);
    }
    const loadOrder = this.resolveDependencies();
    for (const pluginId of loadOrder) {
      const PluginClass = this.plugins.get(pluginId);
      if (this.loadedPlugins.includes(PluginClass)) continue;
      if (this.disabledPlugins.has(pluginId)) continue; // player turned it off
      if (!this._canLoad(PluginClass, gameState)) {
        console.log(`Plugin ${pluginId} not yet unlocked (need: ${PluginClass.manifest.description})`);
        continue;
      }
      try {
        this._initPlugin(PluginClass, gameEngine);
        this.loadedPlugins.push(PluginClass);
        console.log(`Loaded plugin: ${PluginClass.manifest.name}`);
      } catch (error) {
        console.error(`Failed to load plugin ${pluginId}:`, error);
      }
    }
  }

  // Check for newly-unlocked plugins and load them
  static checkAndLoadNewPlugins(gameEngine, gameState) {
    for (const [pluginId, PluginClass] of this.plugins) {
      if (this.loadedPlugins.includes(PluginClass)) continue;
      if (this.disabledPlugins.has(pluginId)) continue; // player turned it off
      if (!this._canLoad(PluginClass, gameState)) continue;
      try {
        this._initPlugin(PluginClass, gameEngine);
        this.loadedPlugins.push(PluginClass);
        console.log(`Dynamically loaded plugin: ${PluginClass.manifest.name}`);
        return PluginClass.manifest.name; // Return name for event log
      } catch (error) {
        console.error(`Failed to load plugin ${pluginId}:`, error);
      }
    }
    return null;
  }

  static resolveDependencies() {
    const sorted = [];
    const visiting = new Set();
    const visited = new Set();
    const invalid = new Set();
    const visit = (pluginId) => {
      if (visited.has(pluginId)) return !invalid.has(pluginId);
      if (visiting.has(pluginId)) {
        invalid.add(pluginId);
        return false;
      }
      const plugin = this.plugins.get(pluginId);
      if (!plugin) return false;
      visiting.add(pluginId);
      for (const depId of plugin.manifest.dependencies || []) {
        if (!visit(depId)) invalid.add(pluginId);
      }
      visiting.delete(pluginId);
      visited.add(pluginId);
      if (!invalid.has(pluginId)) sorted.push(pluginId);
      return !invalid.has(pluginId);
    };
    for (const pluginId of this.plugins.keys()) {
      visit(pluginId);
    }
    return sorted;
  }

  static unload(pluginId, gameEngine) {
    const dependents = this.loadedPlugins.filter(
      plugin => (plugin.manifest.dependencies || []).includes(pluginId),
    );
    for (const dependent of dependents) {
      this.unload(dependent.manifest.id, gameEngine);
    }
    const PluginClass = this.plugins.get(pluginId);
    try {
      if (PluginClass?.cleanup) PluginClass.cleanup(gameEngine);
    } catch (error) {
      console.error(`Failed to clean up plugin ${pluginId}:`, error);
    } finally {
      if (gameEngine) gameEngine.removePlugin(pluginId);
      this.loadedPlugins = this.loadedPlugins.filter(p => p.manifest.id !== pluginId);
    }
    console.log(`Unloaded plugin: ${pluginId}`);
  }

  // Manually (re-)enable a plugin the player previously disabled.
  static enable(pluginId, gameEngine, gameState) {
    const PluginClass = this.plugins.get(pluginId);
    if (!PluginClass) return false;
    if (this.loadedPlugins.includes(PluginClass)) return false; // guard double-init
    if (!this._canLoad(PluginClass, gameState)) return false;
    try {
      this._initPlugin(PluginClass, gameEngine);
      this.loadedPlugins.push(PluginClass);
      console.log(`Manually enabled plugin: ${PluginClass.manifest.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to enable plugin ${pluginId}:`, error);
      return false;
    }
  }

  static _canLoad(PluginClass, gameState) {
    const dependencies = PluginClass.manifest.dependencies || [];
    return (!PluginClass.manifest.unlockCondition || PluginClass.manifest.unlockCondition(gameState))
      && dependencies.every(id => this.loadedPlugins.includes(this.plugins.get(id)));
  }

  static triggerHook(hookName, ...args) {
    for (const PluginClass of this.loadedPlugins) {
      if (typeof PluginClass[hookName] === 'function') {
        try {
          PluginClass[hookName](...args);
        } catch (error) {
          console.error(`Error in ${PluginClass.manifest.id}.${hookName}:`, error);
        }
      }
    }
  }

  static triggerPersistenceHook(hookName, ...args) {
    for (const PluginClass of this.plugins.values()) {
      if (typeof PluginClass[hookName] === 'function') {
        try {
          PluginClass[hookName](...args);
        } catch (error) {
          console.error(`Error in ${PluginClass.manifest.id}.${hookName}:`, error);
        }
      }
    }
  }
}

export class GameEngine {
  constructor() {
    this.resources = new Map();
    this.upgrades = new Map();
    this.events = new Map();
    this.tabs = new Map();
    this.actions = new Map();
    this.hooks = new Map();
  }

  addResource(resourceDef) {
    if (this.resources.has(resourceDef.id)) return;
    this.resources.set(resourceDef.id, {
      ...resourceDef,
      _pluginOwner: PluginRegistry._initializingPluginId || null,
    });
  }

  addUpgrade(upgradeDef) {
    const category = upgradeDef.category || 'core';
    if (!this.upgrades.has(category)) {
      this.upgrades.set(category, []);
    }
    const arr = this.upgrades.get(category);
    if (arr.some(u => u.id === upgradeDef.id)) return; // idempotent on re-init
    arr.push({
      ...upgradeDef,
      _pluginOwner: PluginRegistry._initializingPluginId || null,
    });
  }

  addEvent(eventDef) {
    if (this.events.has(eventDef.id)) return;
    this.events.set(eventDef.id, {
      ...eventDef,
      _pluginOwner: PluginRegistry._initializingPluginId || null,
    });
  }

  addTab(tabDef) {
    if (this.tabs.has(tabDef.id)) return;
    this.tabs.set(tabDef.id, {
      ...tabDef,
      _pluginOwner: PluginRegistry._initializingPluginId || null,
    });
  }

  addAction(id, handler) {
    if (this.actions.has(id)) return;
    this.actions.set(id, {
      handler,
      _pluginOwner: PluginRegistry._initializingPluginId || null,
    });
  }

  runAction(id, state, payload = {}) {
    const action = this.actions.get(id);
    if (!action) return state;
    try {
      return action.handler(state, payload) ?? state;
    } catch (error) {
      console.error(`Action ${id} failed:`, error);
      return state;
    }
  }

  removePlugin(pluginId) {
    for (const [id, def] of this.resources) if (def._pluginOwner === pluginId) this.resources.delete(id);
    for (const [id, def] of this.events) if (def._pluginOwner === pluginId) this.events.delete(id);
    for (const [id, def] of this.tabs) if (def._pluginOwner === pluginId) this.tabs.delete(id);
    for (const [id, action] of this.actions) if (action._pluginOwner === pluginId) this.actions.delete(id);
    for (const [category, upgrades] of this.upgrades) {
      const remaining = upgrades.filter(def => def._pluginOwner !== pluginId);
      if (remaining.length) this.upgrades.set(category, remaining);
      else this.upgrades.delete(category);
    }
    this.off(pluginId);
  }

  on(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    const ownedCallback = (...args) => callback(...args);
    ownedCallback._pluginOwner = PluginRegistry._initializingPluginId || null;
    this.hooks.get(hookName).push(ownedCallback);
  }

  off(pluginId) {
    for (const [hookName, callbacks] of this.hooks) {
      this.hooks.set(hookName, callbacks.filter(cb => cb._pluginOwner !== pluginId));
    }
  }

  emit(hookName, ...args) {
    const callbacks = this.hooks.get(hookName) || [];
    for (const callback of callbacks) {
      callback(...args);
    }
  }

  triggerEvent(eventId) {
    const event = this.events.get(eventId);
    if (event) {
      this.emit('eventTriggered', event);
    }
  }
}
