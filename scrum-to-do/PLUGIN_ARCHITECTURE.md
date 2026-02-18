# BESS Tycoon: Plugin Architecture Specification

## Overview
A dynamic plugin system that allows adding new game phases, features, and mechanics without modifying core game code. Plugins are self-contained JavaScript modules that register themselves with the game engine and can hook into game loops, UI, and state management.

## Design Philosophy
- **Hot-reloadable**: Plugins can be added/removed/updated without restarting
- **Zero core code changes**: Adding a plugin never requires touching main game files
- **Declarative**: Plugins describe what they add, not how to integrate
- **State-safe**: Plugins can add to game state without breaking existing saves
- **Conflict detection**: System warns if two plugins try to modify the same thing

---

## Plugin Structure

### Basic Plugin File Format
```javascript
// plugins/phase-2-scale-up.js

class Phase2ScaleUpPlugin {
  // REQUIRED: Plugin metadata
  static manifest = {
    id: 'phase-2-scale-up',
    name: 'The Scale-Up Nightmare',
    version: '1.0.0',
    author: 'BESS Tycoon Team',
    description: 'Adds regulatory compliance, investor confidence, and certification hell',
    
    // When this plugin becomes available to the player
    unlockCondition: (gameState) => gameState.batteries >= 1000,
    
    // What this plugin requires to function
    dependencies: [],
    
    // What other plugins this conflicts with
    conflicts: [],
  };

  // REQUIRED: Initialize plugin (called once when loaded)
  static init(gameEngine) {
    console.log('[Phase2] Initializing Scale-Up Nightmare...');
    
    // Register new resources
    this.registerResources(gameEngine);
    
    // Register new upgrades
    this.registerUpgrades(gameEngine);
    
    // Register new events
    this.registerEvents(gameEngine);
    
    // Register UI tabs
    this.registerUI(gameEngine);
    
    // Hook into game loops
    this.registerHooks(gameEngine);
  }

  // OPTIONAL: Called every game tick
  static onTick(gameState, deltaTime) {
    // Update plugin-specific logic
    if (gameState.resources.regulatoryCompliance) {
      // Compliance decays over time (regulations change!)
      gameState.resources.regulatoryCompliance *= 0.9995;
    }
  }

  // OPTIONAL: Called when plugin is unloaded
  static cleanup(gameEngine) {
    console.log('[Phase2] Cleaning up...');
    // Remove event listeners, timers, etc.
  }

  // OPTIONAL: Modify save data before saving
  static onBeforeSave(saveData) {
    // Can add plugin-specific data to save
    saveData.phase2Data = {
      certificationsCompleted: this.certificationsCompleted,
    };
    return saveData;
  }

  // OPTIONAL: Process save data after loading
  static onAfterLoad(saveData, gameState) {
    if (saveData.phase2Data) {
      this.certificationsCompleted = saveData.phase2Data.certificationsCompleted;
    }
  }

  // === Implementation Methods ===

  static registerResources(gameEngine) {
    gameEngine.addResource({
      id: 'regulatoryCompliance',
      name: 'Regulatory Compliance',
      icon: '📋',
      startValue: 0,
      displayPrecision: 0,
      tooltip: 'Required to unlock larger markets. Decays over time as regulations change.',
    });

    gameEngine.addResource({
      id: 'investorConfidence',
      name: 'Investor Confidence',
      icon: '💼',
      startValue: 50,
      min: 0,
      max: 100,
      displayPrecision: 0,
      tooltip: 'Affects funding availability. Goes up with success, down with incidents.',
    });

    gameEngine.addResource({
      id: 'gridAccessTokens',
      name: 'Grid Access Tokens',
      icon: '⚡',
      startValue: 1,
      displayPrecision: 0,
      tooltip: 'Limited resource. Each token lets you connect to a more profitable power grid.',
    });
  }

  static registerUpgrades(gameEngine) {
    gameEngine.addUpgrade({
      id: 'ul1973_cert',
      name: 'UL1973 Certification',
      description: 'Required for US market. The paperwork alone weighs 40 lbs.',
      category: 'certifications',
      cost: { money: 50000, regulatoryCompliance: 100 },
      effect: (gameState) => {
        gameState.certifications.ul1973 = true;
        gameState.multipliers.usSalesPrice *= 1.5;
      },
      unlockCondition: (gameState) => gameState.batteries >= 5000,
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'hire_mckinsey',
      name: 'Hire McKinsey Consultants',
      description: 'They will tell you what you already know, but now investors believe it.',
      category: 'consulting',
      cost: { money: 500000 },
      effect: (gameState) => {
        gameState.resources.investorConfidence += 20;
        // Random event triggers after 10 seconds
        setTimeout(() => {
          gameEngine.triggerEvent('mckinsey_report_delivered');
        }, 10000);
      },
      unlockCondition: (gameState) => 
        gameState.resources.investorConfidence < 30 && gameState.money > 1000000,
    });
  }

  static registerEvents(gameEngine) {
    gameEngine.addEvent({
      id: 'ul1973_audit_surprise',
      name: 'Surprise UL1973 Audit!',
      description: 'Auditors found "minor discrepancies" in your test data.',
      probability: 0.05, // 5% chance per minute
      condition: (gameState) => gameState.certifications?.ul1973 === true,
      
      choices: [
        {
          text: 'Re-test everything properly ($30k)',
          cost: { money: 30000 },
          effect: (gameState) => {
            gameState.resources.regulatoryCompliance += 50;
            gameState.resources.investorConfidence += 5;
            return "Crisis averted. Your compliance score increased!";
          },
        },
        {
          text: 'Bribe them with gift cards ($5k)',
          cost: { money: 5000 },
          effect: (gameState) => {
            if (Math.random() < 0.3) {
              // 30% chance they accept
              gameState.resources.regulatoryCompliance += 20;
              return "They accepted! ...You probably shouldn't have done that.";
            } else {
              // 70% chance: DISASTER
              gameState.certifications.ul1973 = false;
              gameState.resources.investorConfidence -= 40;
              return "🚨 THEY REPORTED YOU! Certification REVOKED! Investor confidence tanked!";
            }
          },
        },
        {
          text: 'Ignore it (free)',
          effect: (gameState) => {
            gameState.resources.regulatoryCompliance -= 30;
            return "The audit findings are now public. Your compliance score dropped.";
          },
        },
      ],
    });
  }

  static registerUI(gameEngine) {
    gameEngine.addTab({
      id: 'certifications',
      name: 'Certifications',
      icon: '📜',
      unlockCondition: (gameState) => gameState.batteries >= 1000,
      render: (gameState) => {
        return `
          <div class="certification-tab">
            <h2>The Certification Gauntlet</h2>
            <p>Navigate the bureaucratic nightmare to unlock global markets.</p>
            
            <div class="cert-grid">
              ${this.renderCertification('ul1973', 'UL1973', 'USA 🇺🇸', gameState)}
              ${this.renderCertification('iec62619', 'IEC 62619', 'Europe 🇪🇺', gameState)}
              ${this.renderCertification('ce_mark', 'CE Marking', 'Europe 🇪🇺', gameState)}
              ${this.renderCertification('csa_c22', 'CSA C22.2', 'Canada 🇨🇦', gameState)}
            </div>
            
            <div class="compliance-meter">
              <h3>Regulatory Compliance: ${gameState.resources.regulatoryCompliance.toFixed(0)}</h3>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(gameState.resources.regulatoryCompliance, 100)}%"></div>
              </div>
              <p class="decay-warning">⚠️ Decays 0.05% per second (regulations never stop changing)</p>
            </div>
          </div>
        `;
      },
    });
  }

  static renderCertification(id, name, region, gameState) {
    const hasCert = gameState.certifications?.[id] === true;
    return `
      <div class="cert-card ${hasCert ? 'certified' : 'not-certified'}">
        <h4>${name}</h4>
        <p>${region}</p>
        <div class="cert-status">
          ${hasCert ? '✅ Certified' : '❌ Not Certified'}
        </div>
      </div>
    `;
  }

  static registerHooks(gameEngine) {
    // Hook into the main game loop
    gameEngine.on('tick', (gameState, deltaTime) => {
      this.onTick(gameState, deltaTime);
    });

    // Hook into production calculation
    gameEngine.on('calculateProduction', (gameState) => {
      // If investor confidence is low, production slows
      if (gameState.resources.investorConfidence < 30) {
        gameState.multipliers.productionSpeed *= 0.5;
      }
    });

    // Hook into battery sales
    gameEngine.on('batterySold', (gameState, batteryCount) => {
      // Successful sales increase investor confidence
      if (gameState.resources.investorConfidence < 100) {
        gameState.resources.investorConfidence += batteryCount * 0.01;
      }
    });
  }
}

// REQUIRED: Register the plugin
if (typeof PluginRegistry !== 'undefined') {
  PluginRegistry.register(Phase2ScaleUpPlugin);
}
```

---

## Core Game Engine: Plugin System Implementation

### Plugin Registry (in main game)

```javascript
class PluginRegistry {
  static plugins = new Map();
  static hooks = new Map();
  static loadedPlugins = [];

  // Register a plugin class
  static register(PluginClass) {
    const manifest = PluginClass.manifest;
    
    if (!manifest || !manifest.id) {
      console.error('Plugin missing required manifest.id');
      return;
    }

    // Check for conflicts
    for (const [id, existing] of this.plugins) {
      if (manifest.conflicts?.includes(id) || existing.manifest.conflicts?.includes(manifest.id)) {
        console.warn(`Plugin conflict: ${manifest.id} conflicts with ${id}`);
        return;
      }
    }

    this.plugins.set(manifest.id, PluginClass);
    console.log(`✅ Registered plugin: ${manifest.name} v${manifest.version}`);
  }

  // Load and initialize all registered plugins
  static loadAll(gameEngine, gameState) {
    const loadOrder = this.resolveDependencies();
    
    for (const pluginId of loadOrder) {
      const PluginClass = this.plugins.get(pluginId);
      
      // Check if plugin should be unlocked
      if (PluginClass.manifest.unlockCondition) {
        if (!PluginClass.manifest.unlockCondition(gameState)) {
          console.log(`⏸️ Plugin ${pluginId} not yet unlocked`);
          continue;
        }
      }

      try {
        PluginClass.init(gameEngine);
        this.loadedPlugins.push(PluginClass);
        console.log(`🎮 Loaded plugin: ${PluginClass.manifest.name}`);
      } catch (error) {
        console.error(`❌ Failed to load plugin ${pluginId}:`, error);
      }
    }
  }

  // Resolve plugin dependencies to determine load order
  static resolveDependencies() {
    // Simple topological sort
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

  // Unload a specific plugin
  static unload(pluginId) {
    const PluginClass = this.plugins.get(pluginId);
    if (PluginClass && PluginClass.cleanup) {
      PluginClass.cleanup();
    }
    
    this.loadedPlugins = this.loadedPlugins.filter(p => p.manifest.id !== pluginId);
    console.log(`Unloaded plugin: ${pluginId}`);
  }

  // Call a hook on all loaded plugins
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

// Make it globally available
window.PluginRegistry = PluginRegistry;
```

### Modified Game Engine (main game)

```javascript
class GameEngine {
  constructor() {
    this.state = this.getDefaultState();
    this.resources = new Map();
    this.upgrades = new Map();
    this.events = new Map();
    this.tabs = new Map();
    this.hooks = new Map();
  }

  // === Plugin API Methods ===

  addResource(resourceDef) {
    this.resources.set(resourceDef.id, resourceDef);
    
    // Initialize in game state if not exists
    if (!(resourceDef.id in this.state.resources)) {
      this.state.resources[resourceDef.id] = resourceDef.startValue || 0;
    }
  }

  addUpgrade(upgradeDef) {
    const category = upgradeDef.category || 'misc';
    
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

  // === Core Game Loop ===

  tick(deltaTime) {
    // Emit tick event - plugins can hook into this
    this.emit('tick', this.state, deltaTime);
    
    // Call plugin onTick methods
    PluginRegistry.triggerHook('onTick', this.state, deltaTime);
    
    // Normal game logic...
    this.calculateProduction();
    this.checkRandomEvents();
  }

  calculateProduction() {
    this.emit('calculateProduction', this.state);
    // ... existing production logic
  }

  // === Save/Load with Plugin Support ===

  save() {
    const saveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      gameState: this.state,
      pluginsLoaded: PluginRegistry.loadedPlugins.map(p => p.manifest.id),
    };

    // Let plugins modify save data
    PluginRegistry.triggerHook('onBeforeSave', saveData);

    return saveData;
  }

  load(saveData) {
    this.state = saveData.gameState;
    
    // Let plugins process loaded data
    PluginRegistry.triggerHook('onAfterLoad', saveData, this.state);
    
    // Load plugins that were active in the save
    if (saveData.pluginsLoaded) {
      for (const pluginId of saveData.pluginsLoaded) {
        // Plugins will auto-load if their unlock conditions are met
      }
    }
  }
}
```

---

## Dynamic Plugin Loading

### Load plugins from external files

```javascript
// In main game initialization

async function loadPluginFile(url) {
  try {
    const response = await fetch(url);
    const pluginCode = await response.text();
    
    // Evaluate the plugin code
    // (In production, you'd want better sandboxing)
    eval(pluginCode);
    
    console.log(`✅ Loaded plugin from: ${url}`);
  } catch (error) {
    console.error(`❌ Failed to load plugin from ${url}:`, error);
  }
}

// Load all plugins from a directory
async function loadAllPlugins() {
  const pluginFiles = [
    'plugins/phase-2-scale-up.js',
    'plugins/phase-3-grid-wars.js',
    'plugins/phase-4-global-expansion.js',
    'plugins/phase-5-transcendence.js',
  ];

  for (const file of pluginFiles) {
    await loadPluginFile(file);
  }

  // Initialize all loaded plugins
  PluginRegistry.loadAll(gameEngine, gameEngine.state);
}

// Call this on game start
loadAllPlugins();
```

### Hot-reload during development

```javascript
// Dev mode: watch for plugin changes
if (window.location.hostname === 'localhost') {
  setInterval(async () => {
    // Check for plugin updates
    // (In real implementation, use WebSocket or file watcher)
    await loadAllPlugins();
  }, 5000); // Check every 5 seconds
}
```

---

## Plugin Discovery UI

Add a "Plugins" tab in the game:

```javascript
gameEngine.addTab({
  id: 'plugins',
  name: 'Plugins',
  icon: '🔌',
  render: (gameState) => {
    return `
      <div class="plugins-manager">
        <h2>Plugin Manager</h2>
        
        <div class="plugin-list">
          ${Array.from(PluginRegistry.plugins.values()).map(plugin => {
            const manifest = plugin.manifest;
            const isLoaded = PluginRegistry.loadedPlugins.includes(plugin);
            const canUnlock = manifest.unlockCondition?.(gameState) ?? true;
            
            return `
              <div class="plugin-card ${isLoaded ? 'loaded' : 'not-loaded'}">
                <h3>${manifest.name} <span class="version">v${manifest.version}</span></h3>
                <p>${manifest.description}</p>
                <div class="plugin-status">
                  ${isLoaded ? '✅ Loaded' : (canUnlock ? '⏸️ Available' : '🔒 Locked')}
                </div>
                ${manifest.author ? `<p class="author">By: ${manifest.author}</p>` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="load-custom-plugin">
          <h3>Load Custom Plugin</h3>
          <input type="text" id="plugin-url" placeholder="Enter plugin URL..." />
          <button onclick="loadPluginFile(document.getElementById('plugin-url').value)">
            Load Plugin
          </button>
        </div>
      </div>
    `;
  },
});
```

---

## Advantages of This System

✅ **Modular**: Each phase is self-contained
✅ **Safe**: Plugins can't break existing saves (new resources just get default values)
✅ **Discoverable**: Players can see what plugins are available and when they unlock
✅ **Extensible**: Community could create custom plugins!
✅ **Developer-friendly**: Add new content without touching core code
✅ **Hot-reloadable**: Test changes without restarting the game

---

## Alternative: Import/Export vs. Plugin System

**Import/Export** (what you have now):
- ✅ Simple, works today
- ✅ Players control their save data
- ❌ Only saves *state*, not *game rules*
- ❌ Can't add new features via save files

**Plugin System** (proposed):
- ✅ Adds new *features* and *mechanics*
- ✅ Can be updated without player action
- ✅ Enables community content
- ❌ More complex to implement
- ❌ Requires security considerations

**Best of both worlds:**
- Use plugins for game content/features
- Use import/export for player save data
- Plugins and saves are separate concerns!

---

## Next Steps

1. Implement the `PluginRegistry` and `GameEngine` modifications
2. Refactor existing game logic into "Phase 1" base plugin
3. Create Phase 2 plugin using this template
4. Test hot-reload functionality
5. Add plugin UI tab
6. Create plugin documentation for community creators

---

## Security Considerations (Important!)

⚠️ **For web-hosted version:**
- Only load plugins from trusted sources
- Consider sandboxing plugin code (Web Workers, iframes)
- Validate plugin manifests
- Rate-limit plugin API calls
- Don't expose sensitive game internals

💚 **For local development:**
- Full eval() is fine
- Hot-reload is your friend
- Go wild with testing!

---

*This plugin system is inspired by Minecraft mods, Skyrim plugins, and WordPress plugins. The best games become platforms!*
