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
    } finally {
      this._initializingPluginId = null;
    }
  }

  static register(PluginClass) {
    const manifest = PluginClass.manifest;
    if (!manifest || !manifest.id) {
      console.error('Plugin missing required manifest.id');
      return;
    }
    for (const [id, existing] of this.plugins) {
      if (manifest.conflicts?.includes(id) || existing.manifest.conflicts?.includes(manifest.id)) {
        console.warn(`Plugin conflict: ${manifest.id} conflicts with ${id}`);
        return;
      }
    }
    this.plugins.set(manifest.id, PluginClass);
    console.log(`Registered plugin: ${manifest.name} v${manifest.version}`);
  }

  static loadAll(gameEngine, gameState) {
    const loadOrder = this.resolveDependencies();
    for (const pluginId of loadOrder) {
      const PluginClass = this.plugins.get(pluginId);
      if (this.loadedPlugins.includes(PluginClass)) continue;
      if (this.disabledPlugins.has(pluginId)) continue; // player turned it off
      if (PluginClass.manifest.unlockCondition && !PluginClass.manifest.unlockCondition(gameState)) {
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
      if (PluginClass.manifest.unlockCondition && !PluginClass.manifest.unlockCondition(gameState)) continue;
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
    const visited = new Set();
    const visit = (pluginId) => {
      if (visited.has(pluginId)) return;
      visited.add(pluginId);
      const plugin = this.plugins.get(pluginId);
      if (plugin?.manifest.dependencies) {
        for (const depId of plugin.manifest.dependencies) {
          visit(depId);
        }
      }
      sorted.push(pluginId);
    };
    for (const pluginId of this.plugins.keys()) {
      visit(pluginId);
    }
    return sorted;
  }

  static unload(pluginId, gameEngine) {
    const PluginClass = this.plugins.get(pluginId);
    if (PluginClass && PluginClass.cleanup) {
      PluginClass.cleanup();
    }
    // Remove the plugin's registered gameEngine.on() hooks so its tick
    // logic stops running once disabled (and won't accumulate on re-enable).
    if (gameEngine) gameEngine.off(pluginId);
    this.loadedPlugins = this.loadedPlugins.filter(p => p.manifest.id !== pluginId);
    console.log(`Unloaded plugin: ${pluginId}`);
  }

  // Manually (re-)enable a plugin the player previously disabled.
  static enable(pluginId, gameEngine) {
    const PluginClass = this.plugins.get(pluginId);
    if (!PluginClass) return false;
    if (this.loadedPlugins.includes(PluginClass)) return false; // guard double-init
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
}

export class GameEngine {
  constructor() {
    this.resources = new Map();
    this.upgrades = new Map();
    this.events = new Map();
    this.tabs = new Map();
    this.hooks = new Map();
  }

  addResource(resourceDef) {
    this.resources.set(resourceDef.id, resourceDef);
  }

  addUpgrade(upgradeDef) {
    const category = upgradeDef.category || 'core';
    if (!this.upgrades.has(category)) {
      this.upgrades.set(category, []);
    }
    const arr = this.upgrades.get(category);
    if (arr.some(u => u.id === upgradeDef.id)) return; // idempotent on re-init
    arr.push(upgradeDef);
  }

  addEvent(eventDef) {
    this.events.set(eventDef.id, eventDef);
  }

  addTab(tabDef) {
    this.tabs.set(tabDef.id, tabDef);
  }

  on(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    // Tag the callback with the plugin currently being initialized so
    // unload() can remove exactly the hooks that plugin registered.
    callback._pluginOwner = PluginRegistry._initializingPluginId || null;
    this.hooks.get(hookName).push(callback);
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
