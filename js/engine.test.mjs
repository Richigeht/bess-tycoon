import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';
import { GameEngine, PluginRegistry } from './engine.js';

beforeEach(() => {
  PluginRegistry.plugins.clear();
  PluginRegistry.loadedPlugins = [];
  PluginRegistry.disabledPlugins.clear();
  PluginRegistry._initializingPluginId = null;
});

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

test('loadAll unloads plugins that became disabled', t => {
  let cleanupCalls = 0;
  class Plugin {
    static manifest = { id: 'disable-me', name: 'Disable Me', version: '1' };
    static init() {}
    static cleanup() { cleanupCalls += 1; }
  }
  isolateRegistry(t, []);
  const previousConsoleLog = console.log;
  console.log = () => {};
  t.after(() => { console.log = previousConsoleLog; });
  const engine = new GameEngine();
  PluginRegistry.register(Plugin);
  PluginRegistry.loadAll(engine, {});

  PluginRegistry.disabledPlugins.add('disable-me');
  PluginRegistry.loadAll(engine, {});

  assert.equal(PluginRegistry.loadedPlugins.includes(Plugin), false);
  assert.equal(cleanupCalls, 1);
});

test('disabled dependency reconciliation cleans each loaded plugin once', () => {
  const engine = new GameEngine();
  const cleanupCalls = { dependency: 0, dependent: 0 };
  class Dependency {
    static manifest = { id: 'dependency', name: 'Dependency', version: '1' };
    static init() {}
    static cleanup() { cleanupCalls.dependency += 1; }
  }
  class Dependent {
    static manifest = { id: 'dependent', name: 'Dependent', version: '1', dependencies: ['dependency'] };
    static init() {}
    static cleanup() { cleanupCalls.dependent += 1; }
  }
  PluginRegistry.register(Dependency);
  PluginRegistry.register(Dependent);
  PluginRegistry.loadAll(engine, {});
  PluginRegistry.disabledPlugins.add('dependency');
  PluginRegistry.disabledPlugins.add('dependent');

  PluginRegistry.loadAll(engine, {});

  assert.deepEqual(cleanupCalls, { dependency: 1, dependent: 1 });
  assert.deepEqual(PluginRegistry.loadedPlugins, []);
});

test('unload removes every owned registration', () => {
  const engine = new GameEngine();
  class Plugin {
    static manifest = { id: 'owned', name: 'Owned', version: '1', dependencies: [], conflicts: [] };
    static init(e) {
      e.addResource({ id: 'resource' });
      e.addUpgrade({ id: 'upgrade' });
      e.addEvent({ id: 'event' });
      e.addTab({ id: 'tab' });
      e.addAction('action', state => state);
      e.on('tick', () => {});
    }
  }
  PluginRegistry.register(Plugin);
  PluginRegistry.loadAll(engine, {});
  PluginRegistry.unload('owned', engine);
  assert.deepEqual({
    resources: engine.resources.size,
    upgrades: [...engine.upgrades.values()].flat().length,
    events: engine.events.size,
    tabs: engine.tabs.size,
    actions: engine.actions.size,
    hooks: [...engine.hooks.values()].flat().length,
  }, { resources: 0, upgrades: 0, events: 0, tabs: 0, actions: 0, hooks: 0 });
});

test('failed initialization rolls back owned registrations', () => {
  const engine = new GameEngine();
  class Broken {
    static manifest = { id: 'broken', name: 'Broken', version: '1', dependencies: [], conflicts: [] };
    static init(e) {
      e.addResource({ id: 'partial' });
      e.on('tick', () => {});
      throw new Error('boom');
    }
  }
  PluginRegistry.register(Broken);
  PluginRegistry.loadAll(engine, {});
  assert.equal(engine.resources.size, 0);
  assert.equal([...engine.hooks.values()].flat().length, 0);
});

test('throwing cleanup still unloads and receives the engine', () => {
  const engine = new GameEngine();
  let received;
  class Plugin {
    static manifest = { id: 'cleanup', name: 'Cleanup', version: '1', dependencies: [], conflicts: [] };
    static init(e) { e.on('tick', () => {}); }
    static cleanup(e) { received = e; throw new Error('cleanup failed'); }
  }
  PluginRegistry.register(Plugin);
  PluginRegistry.loadAll(engine, {});
  PluginRegistry.unload('cleanup', engine);
  assert.equal(received, engine);
  assert.equal(PluginRegistry.loadedPlugins.length, 0);
  assert.equal([...engine.hooks.values()].flat().length, 0);
});

test('missing and cyclic dependencies do not block unrelated plugins', () => {
  const loaded = [];
  const make = (id, dependencies = []) => class {
    static manifest = { id, name: id, version: '1', dependencies, conflicts: [] };
    static init() { loaded.push(id); }
  };
  PluginRegistry.register(make('missing-child', ['absent']));
  PluginRegistry.register(make('cycle-a', ['cycle-b']));
  PluginRegistry.register(make('cycle-b', ['cycle-a']));
  PluginRegistry.register(make('healthy'));
  PluginRegistry.loadAll(new GameEngine(), {});
  assert.deepEqual(loaded, ['healthy']);
});

test('dependent plugin requires its dependency to be loaded', () => {
  const Dependency = class {
    static manifest = {
      id: 'dependency', name: 'Dependency', version: '1', dependencies: [], conflicts: [],
      unlockCondition: state => state.unlocked,
    };
    static init() {}
  };
  const Dependent = class {
    static manifest = { id: 'dependent', name: 'Dependent', version: '1', dependencies: ['dependency'], conflicts: [] };
    static init() {}
  };
  PluginRegistry.register(Dependency);
  PluginRegistry.register(Dependent);
  PluginRegistry.loadAll(new GameEngine(), { unlocked: false });
  assert.equal(PluginRegistry.loadedPlugins.length, 0);
});

test('duplicate ids are rejected', () => {
  class First { static manifest = { id: 'same', name: 'First', version: '1' }; static init() {} }
  class Second { static manifest = { id: 'same', name: 'Second', version: '2' }; static init() {} }
  assert.equal(PluginRegistry.register(First), true);
  assert.equal(PluginRegistry.register(Second), false);
  assert.equal(PluginRegistry.plugins.get('same'), First);
});

test('owned actions run only while the plugin is loaded', () => {
  const engine = new GameEngine();
  class Plugin {
    static manifest = { id: 'actions', name: 'Actions', version: '1', dependencies: [], conflicts: [] };
    static init(e) { e.addAction('increment', state => ({ ...state, value: state.value + 1 })); }
  }
  PluginRegistry.register(Plugin);
  PluginRegistry.loadAll(engine, {});
  assert.equal(engine.runAction('increment', { value: 1 }).value, 2);
  PluginRegistry.unload('actions', engine);
  assert.deepEqual(engine.runAction('increment', { value: 2 }), { value: 2 });
});

test('unloading a dependency also unloads transitive dependents', () => {
  const engine = new GameEngine();
  const cleaned = [];
  const make = (id, dependencies = []) => class {
    static manifest = { id, name: id, version: '1', dependencies, conflicts: [] };
    static init(e) { e.on('tick', () => {}); }
    static cleanup() { cleaned.push(id); }
  };
  const Dependency = make('dependency');
  const Dependent = make('dependent', ['dependency']);
  const Transitive = make('transitive', ['dependent']);
  PluginRegistry.register(Dependency);
  PluginRegistry.register(Dependent);
  PluginRegistry.register(Transitive);
  PluginRegistry.loadAll(engine, {});

  PluginRegistry.unload('dependency', engine);

  assert.deepEqual(PluginRegistry.loadedPlugins, []);
  assert.deepEqual(cleaned, ['transitive', 'dependent', 'dependency']);
  assert.equal([...engine.hooks.values()].flat().length, 0);
});

test('failed initialization preserves existing map registrations with colliding ids', () => {
  const engine = new GameEngine();
  engine.addResource({ id: 'shared', name: 'Core resource' });
  engine.addEvent({ id: 'shared', name: 'Core event' });
  engine.addTab({ id: 'shared', name: 'Core tab' });
  engine.addAction('shared', state => ({ ...state, source: 'core' }));
  class Broken {
    static manifest = { id: 'broken-collision', name: 'Broken collision', version: '1' };
    static init(e) {
      e.addResource({ id: 'shared', name: 'Plugin resource' });
      e.addEvent({ id: 'shared', name: 'Plugin event' });
      e.addTab({ id: 'shared', name: 'Plugin tab' });
      e.addAction('shared', state => ({ ...state, source: 'plugin' }));
      throw new Error('boom');
    }
  }
  PluginRegistry.register(Broken);

  PluginRegistry.loadAll(engine, {});

  assert.equal(engine.resources.get('shared').name, 'Core resource');
  assert.equal(engine.events.get('shared').name, 'Core event');
  assert.equal(engine.tabs.get('shared').name, 'Core tab');
  assert.equal(engine.runAction('shared', {}).source, 'core');
});

test('unload preserves existing map registrations with colliding ids', () => {
  const engine = new GameEngine();
  engine.addResource({ id: 'shared', name: 'Core resource' });
  engine.addEvent({ id: 'shared', name: 'Core event' });
  engine.addTab({ id: 'shared', name: 'Core tab' });
  engine.addAction('shared', state => ({ ...state, source: 'core' }));
  class Plugin {
    static manifest = { id: 'collision', name: 'Collision', version: '1' };
    static init(e) {
      e.addResource({ id: 'shared', name: 'Plugin resource' });
      e.addEvent({ id: 'shared', name: 'Plugin event' });
      e.addTab({ id: 'shared', name: 'Plugin tab' });
      e.addAction('shared', state => ({ ...state, source: 'plugin' }));
    }
  }
  PluginRegistry.register(Plugin);
  PluginRegistry.loadAll(engine, {});

  PluginRegistry.unload('collision', engine);

  assert.equal(engine.resources.get('shared').name, 'Core resource');
  assert.equal(engine.events.get('shared').name, 'Core event');
  assert.equal(engine.tabs.get('shared').name, 'Core tab');
  assert.equal(engine.runAction('shared', {}).source, 'core');
});

test('shared hook callbacks retain independent plugin ownership', () => {
  const engine = new GameEngine();
  let calls = 0;
  const shared = () => { calls += 1; };
  const make = id => class {
    static manifest = { id, name: id, version: '1' };
    static init(e) { e.on('tick', shared); }
  };
  const First = make('first');
  const Second = make('second');
  PluginRegistry.register(First);
  PluginRegistry.register(Second);
  PluginRegistry.loadAll(engine, {});
  engine.emit('tick');

  PluginRegistry.unload('second', engine);
  engine.emit('tick');

  assert.equal(calls, 3);
  assert.deepEqual(PluginRegistry.loadedPlugins, [First]);
});
