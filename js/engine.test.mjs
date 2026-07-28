import assert from 'node:assert/strict';
import test from 'node:test';
import { PluginRegistry } from './engine.js';

function isolateRegistry(t, plugins, loadedPlugins = []) {
  const previous = {
    plugins: PluginRegistry.plugins,
    loadedPlugins: PluginRegistry.loadedPlugins,
    disabledPlugins: PluginRegistry.disabledPlugins,
  };
  PluginRegistry.plugins = new Map(plugins.map(plugin => [plugin.manifest.id, plugin]));
  PluginRegistry.loadedPlugins = loadedPlugins;
  PluginRegistry.disabledPlugins = new Set();
  t.after(() => Object.assign(PluginRegistry, previous));
}

test('persistence hooks reach registered plugins while runtime hooks remain loaded-only', t => {
  const calls = [];
  class LoadedPlugin {
    static manifest = { id: 'loaded' };
    static onAfterLoad() { calls.push('loaded:persistence'); }
    static onTick() { calls.push('loaded:runtime'); }
  }
  class RegisteredPlugin {
    static manifest = { id: 'registered' };
    static onAfterLoad() { calls.push('registered:persistence'); }
    static onTick() { calls.push('registered:runtime'); }
  }
  isolateRegistry(t, [LoadedPlugin, RegisteredPlugin], [LoadedPlugin]);

  PluginRegistry.triggerPersistenceHook('onAfterLoad');
  PluginRegistry.triggerHook('onTick');

  assert.deepEqual(calls, [
    'loaded:persistence',
    'registered:persistence',
    'loaded:runtime',
  ]);
});

test('persistence hook failures do not stop later plugins', t => {
  const calls = [];
  class FailingPlugin {
    static manifest = { id: 'failing' };
    static onBeforeSave() { throw new Error('expected test failure'); }
  }
  class FollowingPlugin {
    static manifest = { id: 'following' };
    static onBeforeSave() { calls.push('following'); }
  }
  isolateRegistry(t, [FailingPlugin, FollowingPlugin]);
  const previousConsoleError = console.error;
  console.error = () => {};
  t.after(() => { console.error = previousConsoleError; });

  PluginRegistry.triggerPersistenceHook('onBeforeSave');

  assert.deepEqual(calls, ['following']);
});
