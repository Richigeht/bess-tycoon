# Graph Report - .  (2026-06-27)

## Corpus Check
- Corpus is ~23,523 words - fits in a single context window. You may not need a graph.

## Summary
- 93 nodes · 113 edges · 14 communities (3 shown, 11 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Game UI & State Management|Game UI & State Management]]
- [[_COMMUNITY_React UI & Icon Imports|React UI & Icon Imports]]
- [[_COMMUNITY_Grid Wars Plugin|Grid Wars Plugin]]
- [[_COMMUNITY_Dashboard & Scoring System|Dashboard & Scoring System]]
- [[_COMMUNITY_Core Game Engine|Core Game Engine]]
- [[_COMMUNITY_Scale Up Plugin|Scale Up Plugin]]
- [[_COMMUNITY_Example Plugin Template|Example Plugin Template]]
- [[_COMMUNITY_Plugin Manifest|Plugin Manifest]]
- [[_COMMUNITY_Phase 2 Design Spec|Phase 2 Design Spec]]
- [[_COMMUNITY_Plugin Registry Config|Plugin Registry Config]]
- [[_COMMUNITY_Project Overview|Project Overview]]
- [[_COMMUNITY_Phase 3 Design Spec|Phase 3 Design Spec]]
- [[_COMMUNITY_Plugin Architecture Spec|Plugin Architecture Spec]]

## God Nodes (most connected - your core abstractions)
1. `Phase3GridWarsPlugin` - 17 edges
2. `PluginRegistry` - 15 edges
3. `GameEngine` - 14 edges
4. `BESSTycoon()` - 9 edges
5. `Phase2ScaleUpPlugin` - 8 edges
6. `ExamplePlugin` - 5 edges
7. `scoreDashboard()` - 4 edges
8. `GameLoop` - 4 edges
9. `DEFAULT_GAME_STATE` - 3 edges
10. `loadPluginFiles()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `DASHBOARD_SCENARIOS` --semantically_similar_to--> `Phase3GridWarsPlugin`  [INFERRED] [semantically similar]
  js/dashboard.mjs → plugins/phase-3-grid-wars.js
- `GameUI` --references--> `BESSTycoon()`  [EXTRACTED]
  index.html → js/app.js
- `DEFAULT_GAME_STATE` --shares_data_with--> `Phase3GridWarsPlugin`  [INFERRED]
  js/app.js → plugins/phase-3-grid-wars.js
- `GameLoop` --shares_data_with--> `Phase3GridWarsPlugin`  [INFERRED]
  js/app.js → plugins/phase-3-grid-wars.js
- `Phase3GridWarsPlugin` --calls--> `PluginRegistry`  [EXTRACTED]
  plugins/phase-3-grid-wars.js → js/engine.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plugin Lifecycle System** — js_engine_pluginregistry, js_engine_gameengine, plugins_phase_3_grid_wars_phase3gridwarsplugin [EXTRACTED 1.00]
- **Save/Load Persistence Pipeline** — js_app_savegame, js_app_loadgame, js_app_migratesavedata [EXTRACTED 1.00]
- **Monitoring Dashboard Subsystem** — js_dashboard_dashboard_panels, js_dashboard_dashboard_scenarios, js_dashboard_scoredashboard [EXTRACTED 1.00]

## Communities (14 total, 11 thin omitted)

### Community 0 - "Game UI & State Management"
Cohesion: 0.18
Nodes (10): GameUI, BESSTycoon(), buyPluginUpgrade, buyUpgrade, GameLoop, loadGame, loadPluginFiles(), migrateSaveData() (+2 more)

### Community 3 - "Dashboard & Scoring System"
Cohesion: 0.21
Nodes (10): DEFAULT_GAME_STATE, submitDashboard, DASHBOARD_PANELS, DASHBOARD_SCENARIOS, PANEL_COLOR_CLASSES, scoreDashboard(), bad, good (+2 more)

## Knowledge Gaps
- **14 isolated node(s):** `gameEngine`, `CORE_RESOURCE_IDS`, `PANEL_COLOR_CLASSES`, `investor`, `good` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Phase3GridWarsPlugin` connect `Grid Wars Plugin` to `Game UI & State Management`, `Dashboard & Scoring System`, `Core Game Engine`?**
  _High betweenness centrality (0.241) - this node is a cross-community bridge._
- **Why does `PluginRegistry` connect `Game UI & State Management` to `Grid Wars Plugin`, `Core Game Engine`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Why does `GameEngine` connect `Core Game Engine` to `Game UI & State Management`, `Grid Wars Plugin`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Phase3GridWarsPlugin` (e.g. with `DEFAULT_GAME_STATE` and `GameLoop`) actually correct?**
  _`Phase3GridWarsPlugin` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `gameEngine`, `CORE_RESOURCE_IDS`, `PANEL_COLOR_CLASSES` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React UI & Icon Imports` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._