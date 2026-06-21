# Graph Report - .  (2026-06-20)

## Corpus Check
- Corpus is ~22,728 words - fits in a single context window. You may not need a graph.

## Summary
- 52 nodes · 48 edges · 13 communities (4 shown, 9 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Phase 3 Grid Wars Plugin|Phase 3 Grid Wars Plugin]]
- [[_COMMUNITY_Phase 2 Scale-Up Plugin|Phase 2 Scale-Up Plugin]]
- [[_COMMUNITY_Plugin Init  Hook Registration|Plugin Init / Hook Registration]]
- [[_COMMUNITY_Example Plugin|Example Plugin]]
- [[_COMMUNITY_PluginRegistry Load State|PluginRegistry Load State]]
- [[_COMMUNITY_Plugin Loading Pipeline|Plugin Loading Pipeline]]
- [[_COMMUNITY_Plugin Architecture Core|Plugin Architecture Core]]
- [[_COMMUNITY_Plugin Manifest|Plugin Manifest]]
- [[_COMMUNITY_GameEngine|GameEngine]]
- [[_COMMUNITY_GameEngine.emit|GameEngine.emit]]
- [[_COMMUNITY_Dependency Resolution|Dependency Resolution]]
- [[_COMMUNITY_Hook Triggering|Hook Triggering]]
- [[_COMMUNITY_Plugin Unload|Plugin Unload]]

## God Nodes (most connected - your core abstractions)
1. `Phase3GridWarsPlugin` - 12 edges
2. `Phase2ScaleUpPlugin` - 8 edges
3. `ExamplePlugin` - 5 edges
4. `GameEngine.on` - 4 edges
5. `PluginRegistry.loadAll` - 3 edges
6. `PluginRegistry.loadedPlugins array` - 3 edges
7. `GameEngine.hooks Map (no-dedup push)` - 3 edges
8. `PluginRegistry` - 2 edges
9. `loadPluginFiles (manifest fetch + script injection)` - 2 edges
10. `phase-2-scale-up.js init()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `PHASE_2_SCALE_UP.md design spec` --rationale_for--> `phase-2-scale-up.js init()`  [INFERRED]
  scrum-to-do/PHASE_2_SCALE_UP.md → plugins/phase-2-scale-up.js
- `PHASE_3_GRID_WARS.md design spec` --rationale_for--> `phase-3-grid-wars.js init()`  [INFERRED]
  scrum-to-do/PHASE_3_GRID_WARS.md → plugins/phase-3-grid-wars.js
- `phase-2-scale-up.js init()` --calls--> `GameEngine.on`  [EXTRACTED]
  plugins/phase-2-scale-up.js → index.html
- `phase-3-grid-wars.js init()` --calls--> `GameEngine.on`  [EXTRACTED]
  plugins/phase-3-grid-wars.js → index.html
- `loadPluginFiles (manifest fetch + script injection)` --references--> `plugins/manifest.json`  [EXTRACTED]
  index.html → plugins/manifest.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **All plugin init() functions registering tick hooks with no dedup guard** — plugins_example_plugin_init, plugins_phase_2_scale_up_init, plugins_phase_3_grid_wars_init, indexhtml_gameengine_hooks_map [INFERRED 0.85]

## Communities (13 total, 9 thin omitted)

### Community 2 - "Plugin Init / Hook Registration"
Cohesion: 0.33
Nodes (5): GameEngine.on, phase-2-scale-up.js init(), phase-3-grid-wars.js init(), PHASE_2_SCALE_UP.md design spec, PHASE_3_GRID_WARS.md design spec

### Community 4 - "PluginRegistry Load State"
Cohesion: 0.50
Nodes (5): GameEngine.hooks Map (no-dedup push), loadGame (calls loadAll again after restoring save), PluginRegistry.checkAndLoadNewPlugins, PluginRegistry.loadAll, PluginRegistry.loadedPlugins array

### Community 5 - "Plugin Loading Pipeline"
Cohesion: 0.67
Nodes (3): loadPluginFiles (manifest fetch + script injection), PluginRegistry.register, plugins/manifest.json

### Community 6 - "Plugin Architecture Core"
Cohesion: 0.67
Nodes (3): PluginRegistry, BESS Tycoon (README overview), PLUGIN_ARCHITECTURE.md design spec

## Knowledge Gaps
- **14 isolated node(s):** `plugins`, `PluginRegistry.checkAndLoadNewPlugins`, `PluginRegistry.register`, `PluginRegistry.resolveDependencies`, `PluginRegistry.unload` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameEngine.on` connect `Plugin Init / Hook Registration` to `PluginRegistry Load State`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `plugins`, `PluginRegistry.checkAndLoadNewPlugins`, `PluginRegistry.register` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._