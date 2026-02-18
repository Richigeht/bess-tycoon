# BESS Tycoon: An Incremental Nightmare

A satirical incremental game about battery energy storage and DevOps chaos. Built with React 18, no build step required.

## Plugin Architecture

BESS Tycoon uses a dynamic plugin system that allows adding new game phases, features, and mechanics without modifying core game code.

### How It Works

- **`PluginRegistry`** - Global registry that manages plugin lifecycle (register, load, unload, hooks)
- **`GameEngine`** - Registry/facade providing the plugin API (`addResource`, `addUpgrade`, `addEvent`, `addTab`, `on`/`emit`)
- **"Tick Envelope" pattern** - Each game tick creates a mutable state copy, runs core logic + plugin hooks on it, then commits the final result to React state

### Writing a Plugin

Create a plain JS file in `plugins/` (no JSX/Babel needed):

```javascript
class MyPlugin {
  static manifest = {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    author: 'Your Name',
    description: 'What this plugin does',
    unlockCondition: (gameState) => gameState.batteries >= 100,
    dependencies: [],
    conflicts: [],
  };

  // Called once when loaded
  static init(gameEngine) {
    gameEngine.addResource({
      id: 'myResource',
      name: 'My Resource',
      icon: '✨',
      startValue: 0,
      displayPrecision: 0,
    });

    gameEngine.addUpgrade({
      id: 'my_upgrade',
      name: 'My Upgrade',
      description: 'Does something cool',
      category: 'myCategory',
      cost: { money: 5000 },
      effect: (gameState) => { gameState.resources.myResource += 10; },
      oneTime: true,
    });

    gameEngine.addTab({
      id: 'myTab',
      name: 'My Tab',
      icon: '🎮',
      unlockCondition: (gs) => gs.batteries >= 200,
      render: (gameState) => `<div><h2>My Plugin Tab</h2></div>`,
    });

    gameEngine.on('tick', (state, deltaTime) => {
      // Hook into the game loop
    });
  }

  // Called every game tick
  static onTick(gameState, deltaTime) {
    // Update plugin-specific logic
  }

  // Modify save data before saving
  static onBeforeSave(saveData) {
    saveData.pluginData.myPlugin = { /* ... */ };
  }

  // Process save data after loading
  static onAfterLoad(saveData, gameState) {
    if (saveData.pluginData?.myPlugin) { /* ... */ }
  }

  // Called when plugin is unloaded
  static cleanup(gameEngine) {}
}

if (typeof PluginRegistry !== 'undefined') {
  PluginRegistry.register(MyPlugin);
}
```

Then add the filename to `plugins/manifest.json`:

```json
{
  "plugins": ["my-plugin.js"]
}
```

### Plugin API

| Method | Description |
|--------|-------------|
| `gameEngine.addResource(def)` | Add a new resource to the status bar |
| `gameEngine.addUpgrade(def)` | Add a purchasable upgrade |
| `gameEngine.addEvent(def)` | Register a random event |
| `gameEngine.addTab(def)` | Create a new UI tab |
| `gameEngine.on(hook, callback)` | Listen to game hooks (`tick`, `calculateProduction`, `upgradePurchased`, `eventTriggered`) |
| `gameEngine.emit(hook, ...args)` | Trigger a hook |
| `gameEngine.triggerEvent(eventId)` | Trigger a registered event |

### Plugin Lifecycle Hooks

| Hook | When | Arguments |
|------|------|-----------|
| `init(gameEngine)` | Plugin loaded | GameEngine instance |
| `onTick(gameState, deltaTime)` | Every game tick (1s) | Mutable state copy, delta time |
| `onBeforeSave(saveData)` | Before saving | Save data object (mutable) |
| `onAfterLoad(saveData, gameState)` | After loading | Save data, game state |
| `cleanup(gameEngine)` | Plugin unloaded | GameEngine instance |

### Game State Shape

Plugins can read/write these fields on the `gameState` object passed to hooks:

```javascript
{
  money, batteries, batteriesPerSecond, techDebt, coffee, clickPower,
  upgrades: { intern, autoAssembler, skipTesting, alibabaOrder, ignoreCerts, grafanaLicense },
  events: [{ text, time }],
  achievements: [{ id, name, description }],
  grafanaUnlocked,
  metrics: { temperature, voltage, soc, alerts },
  resources: {},        // Plugin-added resources (keyed by resource id)
  certifications: {},   // Certification flags
  multipliers: { productionSpeed, usSalesPrice },
  pluginData: {},       // Arbitrary plugin state
}
```

### Planned Plugins

- **Phase 2: The Scale-Up Nightmare** - Regulatory compliance, investor confidence, certification gauntlet
- **Phase 3: The Grid Integration Wars** - Energy trading, frequency regulation, algorithmic optimization
- **Phase 4: Global Expansion** - International markets
- **Phase 5: Transcendence** - End-game content

## Development

No build step required. Open `index.html` directly or serve with any static file server:

```bash
npx serve .
# or
python3 -m http.server
```

Plugin loading requires a server (fetch won't work with `file://` protocol).

## Credits

A satirical tribute to Universal Paperclips & the chaos of DevOps.
