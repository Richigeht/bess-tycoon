// === Plugin System ===

export class PluginRegistry {
  static plugins = new Map();
  static loadedPlugins = [];

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
      if (PluginClass.manifest.unlockCondition && !PluginClass.manifest.unlockCondition(gameState)) {
        console.log(`Plugin ${pluginId} not yet unlocked (need: ${PluginClass.manifest.description})`);
        continue;
      }
      try {
        PluginClass.init(gameEngine);
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
      if (PluginClass.manifest.unlockCondition && !PluginClass.manifest.unlockCondition(gameState)) continue;
      try {
        PluginClass.init(gameEngine);
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

  static unload(pluginId) {
    const PluginClass = this.plugins.get(pluginId);
    if (PluginClass && PluginClass.cleanup) {
      PluginClass.cleanup();
    }
    this.loadedPlugins = this.loadedPlugins.filter(p => p.manifest.id !== pluginId);
    console.log(`Unloaded plugin: ${pluginId}`);
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
    this.upgrades.get(category).push(upgradeDef);
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
    this.hooks.get(hookName).push(callback);
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
