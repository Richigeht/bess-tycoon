// Example Plugin - demonstrates the plugin system
// This is a plain JS file (no JSX/Babel needed)

class ExamplePlugin {
  static manifest = {
    id: 'example',
    name: 'Example Plugin',
    version: '0.1.0',
    author: 'BESS Tycoon Team',
    description: 'A test plugin that adds a "Hype" resource. For validating the plugin system.',
    unlockCondition: () => true,
    dependencies: [],
    conflicts: [],
  };

  static init(gameEngine) {
    console.log('[ExamplePlugin] Initializing...');

    gameEngine.addResource({
      id: 'hype',
      name: 'Hype',
      icon: '🚀',
      startValue: 0,
      displayPrecision: 1,
      tooltip: 'Meaningless startup hype. Goes up for no reason.',
    });

    gameEngine.addUpgrade({
      id: 'hire_influencer',
      name: 'Hire TikTok Influencer',
      description: 'Generates hype. Somehow this counts as marketing.',
      category: 'marketing',
      cost: { money: 10000 },
      effect: function(gameState) {
        gameState.resources.hype = (gameState.resources.hype || 0) + 50;
      },
      unlockCondition: function(gameState) { return gameState.batteries >= 10; },
      oneTime: true,
    });

    gameEngine.on('tick', function(state, deltaTime) {
      // Hype grows slowly on its own
      if (state.resources.hype !== undefined && state.resources.hype > 0) {
        state.resources.hype += 0.1;
      }
    });

    console.log('[ExamplePlugin] Initialized successfully');
  }

  static onTick(gameState, deltaTime) {
    // Hype decays very slowly
    if (gameState.resources.hype > 0) {
      gameState.resources.hype *= 0.999;
    }
  }

  static onBeforeSave(saveData) {
    saveData.pluginData = saveData.pluginData || {};
    saveData.pluginData.examplePlugin = {
      hype: saveData.resources?.hype || 0,
    };
  }

  static onAfterLoad(saveData, gameState) {
    if (saveData.pluginData?.examplePlugin) {
      gameState.resources = gameState.resources || {};
      gameState.resources.hype = saveData.pluginData.examplePlugin.hype || 0;
    }
  }
}

if (typeof PluginRegistry !== 'undefined') {
  PluginRegistry.register(ExamplePlugin);
}
