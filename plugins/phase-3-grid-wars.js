// Phase 3: The Grid Integration Wars
// "Your batteries are now financial instruments. Congratulations?"
// Unlock: 100,000 batteries produced + 3 grid access tokens (from Phase 2)

class Phase3GridWarsPlugin {
  static manifest = {
    id: 'phase-3-grid-wars',
    name: 'The Grid Integration Wars',
    version: '1.0.0',
    author: 'BESS Tycoon Team',
    description: 'Energy trading, frequency regulation, algorithmic optimization, and market chaos.',
    unlockCondition: function(gameState) {
      return gameState.batteries >= 100000 &&
        (gameState.resources.gridAccessTokens || 0) >= 3;
    },
    unlockHint: 'Reach 100,000 batteries and obtain 3 Grid Access Tokens (from Phase 2 lobbying)',
    dependencies: ['phase-2-scale-up'],
    conflicts: [],
  };

  // === Internal State ===
  static _unlockFired = false;
  static _tickCounter = 0;
  static _priceHistory = [];
  static _currentPrice = 50;
  static _tradeCount = 0;
  static _profitableTradeCount = 0;
  static _totalTradeProfit = 0;
  static _consecutiveProfitDays = 0;
  static _dayProfitAccumulator = 0;
  static _dayTickCounter = 0;
  static _flashCrashActive = false;
  static _flashCrashTicks = 0;
  static _polarVortexStage = 0;
  static _polarVortexTicks = 0;
  static _solarFloodActive = false;
  static _solarFloodTicks = 0;
  static _firmwareBugActive = false;
  static _firmwareBugTicks = 0;
  static _cyberBreachActive = false;
  static _cyberBreachTicks = 0;
  static _frequencyEventCooldown = 0;
  static _frequencyMissStreak = 0;
  static _frequencyBanned = false;
  static _frequencyBanTicks = 0;
  static _totalFrequencyEvents = 0;
  static _fastFrequencyResponses = 0;
  static _connectedGrids = [];
  static _gridRelationships = { caiso: 0, pjm: 20, ercot: -10, miso: 0, nyiso: -5 };
  static _batteryDegradation = 0;
  static _cycleCount = 0;
  static _portfolioAllocation = { dayAhead: 50, realTime: 30, frequency: 20 };
  static _riskTolerance = 30;
  static _autoTrading = false;
  static _blackStartPerformed = false;
  static _lastTradeProfit = 0;
  static _lastTradeRevenue = 0;
  static _lastTradePrice = 0;
  static _lastTradeSize = 0;
  static _lastFrequencyPayment = 0;

  static init(gameEngine) {
    console.log('[Phase3] Initializing The Grid Integration Wars...');

    // === RESOURCES ===
    gameEngine.addResource({
      id: 'mwhTraded',
      name: 'MWh Traded',
      icon: '⚡',
      startValue: 0,
      displayPrecision: 0,
      tooltip: 'How many electron-kilometers have you moved? This many.',
    });

    gameEngine.addResource({
      id: 'frequencyCredits',
      name: 'FR Credits',
      icon: '🎯',
      startValue: 0,
      displayPrecision: 0,
      tooltip: 'The grid needs EXACT response. Not pretty good. EXACT.',
    });

    gameEngine.addResource({
      id: 'algorithmScore',
      name: 'Algo Score',
      icon: '🤖',
      startValue: 30,
      displayPrecision: 0,
      tooltip: "Your algorithm's IQ. Higher is better.",
    });

    gameEngine.addResource({
      id: 'carbonCredits',
      name: 'Carbon Credits',
      icon: '🍃',
      startValue: 0,
      displayPrecision: 1,
      tooltip: 'Everyone pretends these matter. You\'re no exception.',
    });

    gameEngine.addResource({
      id: 'gridStability',
      name: 'Grid Stability',
      icon: '⚖️',
      startValue: 50,
      displayPrecision: 0,
      tooltip: 'The grid is a living thing. Don\'t kill it.',
    });

    // === TRADING ALGORITHM UPGRADES ===
    gameEngine.addUpgrade({
      id: 'algo_python',
      name: 'Python Script v1',
      description: 'Basic automation. while True: if price > buy_price: sell(). Works 60% of the time.',
      category: 'trading',
      cost: { money: 50000 },
      effect: function(state) {
        state.resources.algorithmScore = Math.min(100, (state.resources.algorithmScore || 30) + 15);
        state.events = [{ text: "🐍 Python script deployed! It works 60% of the time, every time.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.batteries >= 100000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'algo_ml',
      name: 'ML Predictor',
      description: 'Random forest meets power market. Surprisingly effective! +25 algo score.',
      category: 'trading',
      cost: { money: 200000 },
      effect: function(state) {
        state.resources.algorithmScore = Math.min(100, (state.resources.algorithmScore || 30) + 25);
        state.events = [{ text: "🌲 ML Predictor online! Random forest, meet power market.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_algo_python; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'algo_quant',
      name: 'Quant Trader Bot',
      description: 'Hired a PhD from Jane Street. 10,000 lines of Rust. +35 algo score.',
      category: 'trading',
      cost: { money: 500000 },
      effect: function(state) {
        state.resources.algorithmScore = Math.min(100, (state.resources.algorithmScore || 30) + 35);
        state.events = [{ text: "🦀 Quant bot deployed! 10,000 lines of Rust, zero panics (so far).", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_algo_ml; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'algo_deep_rl',
      name: 'Deep RL Agent',
      description: "It's teaching itself. We think that's good? +45 algo score.",
      category: 'trading',
      cost: { money: 2000000 },
      effect: function(state) {
        state.resources.algorithmScore = Math.min(100, (state.resources.algorithmScore || 30) + 45);
        state.events = [{ text: "🧠 Deep RL Agent active! It's teaching itself. We think that's good?", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_algo_quant; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'algo_oracle',
      name: 'The Oracle',
      description: 'Precognitive trading. Might be insider trading. Might be magic. +50 algo score.',
      category: 'trading',
      cost: { money: 10000000 },
      effect: function(state) {
        state.resources.algorithmScore = Math.min(100, (state.resources.algorithmScore || 30) + 50);
        state.events = [{ text: "🔮 The Oracle activated! Might be insider trading. Might be magic. Both?", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) {
        return state.pluginData.upgrade_algo_deep_rl && (state.resources.algorithmScore || 0) >= 90;
      },
      oneTime: true,
    });

    // === FREQUENCY RESPONSE UPGRADES ===
    gameEngine.addUpgrade({
      id: 'freq_scada',
      name: 'Basic SCADA System',
      description: 'Supervisory control, but s l o w. +5 FR credits/day.',
      category: 'frequency',
      cost: { money: 100000 },
      effect: function(state) {
        state.events = [{ text: "📡 SCADA system online! Supervisory control... but s l o w.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.batteries >= 100000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'freq_plc',
      name: 'Fast PLC Control',
      description: 'Programmable logic, emphasis on FAST. +15 FR credits/day.',
      category: 'frequency',
      cost: { money: 300000 },
      effect: function(state) {
        state.events = [{ text: "⚡ PLC control installed! Fast response, fewer missed events.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_freq_scada; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'freq_hardware',
      name: 'Hardware Response Unit',
      description: 'Dedicated circuits. No software delays. +30 FR credits/day.',
      category: 'frequency',
      cost: { money: 800000 },
      effect: function(state) {
        state.events = [{ text: "🔧 Hardware response unit installed! Sub-50ms reaction time.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_freq_plc; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'freq_quantum',
      name: 'Quantum Predictor',
      description: 'Responds BEFORE the event happens. Physics hates it. +100 FR credits/day.',
      category: 'frequency',
      cost: { money: 5000000 },
      effect: function(state) {
        state.events = [{ text: "🔮 Quantum predictor active! Responds before events happen. Physics is confused.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_freq_hardware; },
      oneTime: true,
    });

    // === MARKET PARTICIPATION UPGRADES ===
    gameEngine.addUpgrade({
      id: 'market_realtime',
      name: 'Real-Time Market Access',
      description: '5-minute markets. Revenue x1.5. Requires basic algorithm.',
      category: 'markets',
      cost: { money: 100000 },
      effect: function(state) {
        state.events = [{ text: "📈 Real-time market access! 5-minute intervals. Refresh... constantly.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_algo_python; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'market_frequency',
      name: 'Frequency Regulation Market',
      description: 'The big leagues. Revenue x3.0. Requires 100 FR credits + fast response.',
      category: 'markets',
      cost: { money: 500000 },
      effect: function(state) {
        state.events = [{ text: "🎯 Frequency regulation market access! The stressful leagues.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) {
        return state.pluginData.upgrade_freq_scada && (state.resources.frequencyCredits || 0) >= 100;
      },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'market_voltage',
      name: 'Voltage Support Market',
      description: 'Nobody knows what voltage support is, but it pays. Revenue x2.0.',
      category: 'markets',
      cost: { money: 300000 },
      effect: function(state) {
        state.events = [{ text: "⚡ Voltage support market unlocked! Nobody knows what it is, but it pays.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_market_realtime; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'market_blackstart',
      name: 'Black Start Service',
      description: 'When the grid dies, you\'re the defibrillator. Revenue x5.0. High stakes.',
      category: 'markets',
      cost: { money: 2000000 },
      effect: function(state) {
        state.events = [{ text: "🌑 Black start service registered! When everything goes dark, you bring the light.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) {
        return state.pluginData.upgrade_market_frequency &&
          (state.resources.frequencyCredits || 0) >= 500;
      },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'market_demand_response',
      name: 'Demand Response Program',
      description: "Turn off Big Corp's AC when grid is stressed. Revenue x2.5.",
      category: 'markets',
      cost: { money: 150000 },
      effect: function(state) {
        state.events = [{ text: "🏢 Demand response enrolled! Corporate AC: optional during peak.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_market_realtime; },
      oneTime: true,
    });

    // === GRID OPERATOR CONNECTIONS ===
    gameEngine.addUpgrade({
      id: 'grid_caiso',
      name: 'Connect to CAISO (California)',
      description: 'California grid. Sunny, renewable-heavy, expensive. Relationship: Neutral.',
      category: 'grids',
      cost: { money: 50000 },
      effect: function(state) {
        Phase3GridWarsPlugin._connectedGrids.push('caiso');
        state.events = [{ text: "☀️ Connected to CAISO! Welcome to the California energy market.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.batteries >= 100000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'grid_pjm',
      name: 'Connect to PJM (East Coast)',
      description: 'East Coast grid. Huge market, friendly operators. Relationship: Friendly.',
      category: 'grids',
      cost: { money: 75000 },
      effect: function(state) {
        Phase3GridWarsPlugin._connectedGrids.push('pjm');
        state.events = [{ text: "🗽 Connected to PJM! The largest RTO in the US welcomes you.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.batteries >= 100000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'grid_ercot',
      name: 'Connect to ERCOT (Texas)',
      description: 'Texas grid. Wild west. They hate you. Good luck. Relationship: Hostile.',
      category: 'grids',
      cost: { money: 100000 },
      effect: function(state) {
        Phase3GridWarsPlugin._connectedGrids.push('ercot');
        state.events = [{ text: "🤠 Connected to ERCOT! The Wild West of energy markets. Yeehaw.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_grid_caiso || state.pluginData.upgrade_grid_pjm; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'grid_miso',
      name: 'Connect to MISO (Midwest)',
      description: 'Midwest grid. Corn, wind turbines, and cheap electrons. Relationship: Unknown.',
      category: 'grids',
      cost: { money: 60000 },
      effect: function(state) {
        Phase3GridWarsPlugin._connectedGrids.push('miso');
        state.events = [{ text: "🌽 Connected to MISO! Corn, wind turbines, and cheap electrons.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_grid_caiso || state.pluginData.upgrade_grid_pjm; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'grid_nyiso',
      name: 'Connect to NYISO (New York)',
      description: 'New York grid. Skeptical regulators, premium prices. Relationship: Skeptical.',
      category: 'grids',
      cost: { money: 80000 },
      effect: function(state) {
        Phase3GridWarsPlugin._connectedGrids.push('nyiso');
        state.events = [{ text: "🗽 Connected to NYISO! New York: expensive, skeptical, profitable.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) {
        return (state.pluginData.upgrade_grid_caiso ? 1 : 0) +
          (state.pluginData.upgrade_grid_pjm ? 1 : 0) +
          (state.pluginData.upgrade_grid_ercot ? 1 : 0) +
          (state.pluginData.upgrade_grid_miso ? 1 : 0) >= 2;
      },
      oneTime: true,
    });

    // === CARBON PROGRAM UPGRADES ===
    gameEngine.addUpgrade({
      id: 'carbon_gov_program',
      name: 'Government Carbon Program',
      description: 'Enroll in federal carbon credit program. +5 credits immediately, ongoing gains.',
      category: 'carbon',
      cost: { money: 75000 },
      effect: function(state) {
        state.resources.carbonCredits = (state.resources.carbonCredits || 0) + 5;
        state.events = [{ text: "🍃 Enrolled in government carbon program! +5 credits. The paperwork was... extensive.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.batteries >= 100000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'carbon_corporate',
      name: 'Corporate Sustainability Contract',
      description: 'Big Corp wants your green creds. +50 carbon credits. Ongoing supply.',
      category: 'carbon',
      cost: { money: 200000 },
      effect: function(state) {
        state.resources.carbonCredits = (state.resources.carbonCredits || 0) + 50;
        state.events = [{ text: "🏢 Corporate sustainability contract signed! +50 credits. Big Corp is greenwashing through you.", time: Date.now() }, ...state.events.slice(0, 9)];
      },
      unlockCondition: function(state) { return state.pluginData.upgrade_carbon_gov_program; },
      oneTime: true,
    });

    // === TRADING DASHBOARD TAB ===
    gameEngine.addTab({
      id: 'trading',
      name: 'Trading',
      icon: '📈',
      unlockCondition: function(gs) { return gs.batteries >= 100000; },
      render: function(gs) {
        var p = Phase3GridWarsPlugin;
        var price = p._currentPrice;
        var algoScore = gs.resources.algorithmScore || 30;
        var frCredits = gs.resources.frequencyCredits || 0;
        var gridStab = gs.resources.gridStability || 50;
        var mwhTraded = gs.resources.mwhTraded || 0;
        var carbon = gs.resources.carbonCredits || 0;

        // Letter grade for algo score
        var grade = 'F';
        if (algoScore >= 95) grade = 'S';
        else if (algoScore >= 80) grade = 'A';
        else if (algoScore >= 60) grade = 'B';
        else if (algoScore >= 40) grade = 'C';
        else if (algoScore >= 25) grade = 'D';

        // Price color
        var priceColor = price > 150 ? '#ef4444' : price > 80 ? '#f59e0b' : price < 30 ? '#22c55e' : '#06b6d4';

        // Grid stability color
        var stabColor = gridStab >= 80 ? '#22c55e' : gridStab >= 60 ? '#06b6d4' : gridStab >= 30 ? '#f59e0b' : '#ef4444';
        var stabLabel = gridStab >= 80 ? 'Excellent' : gridStab >= 60 ? 'Good' : gridStab >= 30 ? 'Unstable' : 'CRITICAL';

        // Price history bars
        var histBars = '';
        var hist = p._priceHistory.slice(-30);
        var maxP = Math.max.apply(null, hist.length ? hist : [100]);
        for (var i = 0; i < hist.length; i++) {
          var pct = Math.round((hist[i] / Math.max(maxP, 1)) * 100);
          var bColor = hist[i] > 150 ? '#ef4444' : hist[i] > 80 ? '#f59e0b' : hist[i] < 30 ? '#22c55e' : '#06b6d4';
          histBars += '<div style="width:8px;height:' + pct + '%;background:' + bColor + ';border-radius:2px 2px 0 0;"></div>';
        }

        // Active markets
        var markets = [];
        markets.push('Day-Ahead (x1.0)');
        if (gs.pluginData.upgrade_market_realtime) markets.push('Real-Time (x1.5)');
        if (gs.pluginData.upgrade_market_frequency) markets.push('Frequency (x3.0)');
        if (gs.pluginData.upgrade_market_voltage) markets.push('Voltage (x2.0)');
        if (gs.pluginData.upgrade_market_blackstart) markets.push('Black Start (x5.0)');
        if (gs.pluginData.upgrade_market_demand_response) markets.push('Demand Resp. (x2.5)');

        // Connected grids
        var grids = p._connectedGrids;
        var gridCards = '';
        for (var g = 0; g < grids.length; g++) {
          var gid = grids[g];
          var rel = p._gridRelationships[gid] || 0;
          var rColor = rel > 10 ? '#22c55e' : rel > -10 ? '#f59e0b' : '#ef4444';
          var rLabel = rel > 10 ? 'Friendly' : rel > -10 ? 'Neutral' : 'Hostile';
          gridCards += '<div style="background:#1e293b;padding:8px 12px;border-radius:6px;border:1px solid ' + rColor + '40;display:inline-block;margin:4px;">' +
            '<span style="font-weight:bold;color:#e2e8f0;">' + gid.toUpperCase() + '</span>' +
            ' <span style="color:' + rColor + ';font-size:11px;">(' + rLabel + ' ' + (rel >= 0 ? '+' : '') + rel + ')</span></div>';
        }

        // Trade stats
        var winRate = p._tradeCount > 0 ? Math.round((p._profitableTradeCount / p._tradeCount) * 100) : 0;
        var avgProfit = p._tradeCount > 0 ? Math.round(p._totalTradeProfit / p._tradeCount) : 0;

        // Active events
        var activeEvents = [];
        if (p._flashCrashActive) activeEvents.push('⚠️ FLASH CRASH');
        if (p._polarVortexStage > 0) activeEvents.push('🥶 POLAR VORTEX (Stage ' + p._polarVortexStage + ')');
        if (p._solarFloodActive) activeEvents.push('☀️ SOLAR FLOOD');
        if (p._firmwareBugActive) activeEvents.push('🐛 FIRMWARE BUG');
        if (p._cyberBreachActive) activeEvents.push('🔓 CYBER BREACH');
        if (p._frequencyBanned) activeEvents.push('🚫 FR MARKET BAN');

        var eventsHtml = activeEvents.length > 0
          ? activeEvents.map(function(e) { return '<span style="background:#7f1d1d;color:#fca5a5;padding:2px 8px;border-radius:4px;font-size:11px;margin:2px;">' + e + '</span>'; }).join(' ')
          : '<span style="color:#6b7280;font-size:12px;">No active events</span>';

        return '<div style="font-family:system-ui,sans-serif;color:#e2e8f0;">' +
          // Header
          '<div style="background:#0f172a;padding:20px;border-radius:12px;border:1px solid #06b6d440;margin-bottom:16px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
              '<div>' +
                '<div style="font-size:14px;color:#94a3b8;">LIVE ELECTRICITY PRICE</div>' +
                '<div style="font-size:42px;font-weight:bold;color:' + priceColor + ';font-family:monospace;">$' + price.toFixed(2) + '<span style="font-size:16px;color:#64748b;">/MWh</span></div>' +
              '</div>' +
              '<div style="text-align:right;">' +
                '<div style="font-size:14px;color:#94a3b8;">ALGORITHM</div>' +
                '<div style="font-size:36px;font-weight:bold;color:#a78bfa;">' + grade + ' <span style="font-size:16px;color:#64748b;">(' + Math.round(algoScore) + '/100)</span></div>' +
              '</div>' +
            '</div>' +
            // Price history chart
            '<div style="margin-top:12px;height:60px;display:flex;align-items:flex-end;gap:2px;background:#020617;border-radius:6px;padding:4px;">' +
              histBars +
            '</div>' +
            '<div style="font-size:10px;color:#475569;margin-top:4px;">Price history (last 30 ticks)</div>' +
          '</div>' +

          // Active events banner
          '<div style="background:#1e293b;padding:10px 16px;border-radius:8px;margin-bottom:16px;border:1px solid #334155;">' +
            '<span style="color:#94a3b8;font-size:12px;margin-right:8px;">ACTIVE:</span>' + eventsHtml +
          '</div>' +

          // Stats row
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;">' +
            '<div style="background:#1e293b;padding:12px;border-radius:8px;border:1px solid #06b6d430;">' +
              '<div style="font-size:11px;color:#94a3b8;">Grid Stability</div>' +
              '<div style="font-size:24px;font-weight:bold;color:' + stabColor + ';">' + Math.round(gridStab) + '</div>' +
              '<div style="font-size:10px;color:' + stabColor + ';">' + stabLabel + '</div>' +
            '</div>' +
            '<div style="background:#1e293b;padding:12px;border-radius:8px;border:1px solid #06b6d430;">' +
              '<div style="font-size:11px;color:#94a3b8;">FR Credits</div>' +
              '<div style="font-size:24px;font-weight:bold;color:#fbbf24;">' + Math.round(frCredits) + '</div>' +
              '<div style="font-size:10px;color:#94a3b8;">🎯 ' + p._totalFrequencyEvents + ' events</div>' +
            '</div>' +
            '<div style="background:#1e293b;padding:12px;border-radius:8px;border:1px solid #06b6d430;">' +
              '<div style="font-size:11px;color:#94a3b8;">MWh Traded</div>' +
              '<div style="font-size:24px;font-weight:bold;color:#06b6d4;">' + Math.floor(mwhTraded).toLocaleString() + '</div>' +
              '<div style="font-size:10px;color:#94a3b8;">' + p._tradeCount + ' trades</div>' +
            '</div>' +
            '<div style="background:#1e293b;padding:12px;border-radius:8px;border:1px solid #06b6d430;">' +
              '<div style="font-size:11px;color:#94a3b8;">Carbon Credits</div>' +
              '<div style="font-size:24px;font-weight:bold;color:#22c55e;">' + carbon.toFixed(1) + '</div>' +
              '<div style="font-size:10px;color:#94a3b8;">🍃 ESG score</div>' +
            '</div>' +
            '<div style="background:#1e293b;padding:12px;border-radius:8px;border:1px solid #06b6d430;">' +
              '<div style="font-size:11px;color:#94a3b8;">Win Rate</div>' +
              '<div style="font-size:24px;font-weight:bold;color:' + (winRate >= 60 ? '#22c55e' : winRate >= 40 ? '#f59e0b' : '#ef4444') + ';">' + winRate + '%</div>' +
              '<div style="font-size:10px;color:#94a3b8;">Avg: $' + avgProfit.toLocaleString() + '/trade</div>' +
            '</div>' +
            '<div style="background:#1e293b;padding:12px;border-radius:8px;border:1px solid #06b6d430;">' +
              '<div style="font-size:11px;color:#94a3b8;">Profit Streak</div>' +
              '<div style="font-size:24px;font-weight:bold;color:#a78bfa;">' + p._consecutiveProfitDays + ' days</div>' +
              '<div style="font-size:10px;color:#94a3b8;">Degradation: ' + p._batteryDegradation.toFixed(1) + '%</div>' +
            '</div>' +
          '</div>' +

          // Revenue Breakdown
          (function() {
            var prodIncome = gs.batteriesPerSecond * 10;
            var lastTP = p._lastTradeProfit;
            var lastTS = p._lastTradeSize;
            var lastTPr = p._lastTradePrice;
            var tradingPerSec = p._tradeCount > 0 ? (p._totalTradeProfit / p._tradeCount) / 5 : 0;
            var freqPay = p._lastFrequencyPayment;
            var totalPerSec = prodIncome + tradingPerSec;
            var tpColor = lastTP >= 0 ? '#22c55e' : '#ef4444';
            var tpSign = lastTP >= 0 ? '+' : '';
            var efficiency = (gs.resources.algorithmScore || 30) / 100;
            var margin = (0.05 + efficiency * 0.20) * 100;

            return '<div style="background:#0f172a;padding:16px;border-radius:8px;border:1px solid #22c55e30;margin-bottom:16px;">' +
              '<div style="font-weight:bold;color:#22c55e;margin-bottom:10px;">💰 Revenue Breakdown</div>' +
              '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                // Production income
                '<div style="background:#1e293b;padding:10px;border-radius:6px;">' +
                  '<div style="font-size:11px;color:#94a3b8;">🔋 Production Income</div>' +
                  '<div style="font-size:18px;font-weight:bold;color:#22c55e;">+$' + Math.round(prodIncome).toLocaleString() + '/sec</div>' +
                  '<div style="font-size:10px;color:#64748b;">' + gs.batteriesPerSecond.toFixed(1) + ' batt/s × $10/batt</div>' +
                '</div>' +
                // Trading income
                '<div style="background:#1e293b;padding:10px;border-radius:6px;">' +
                  '<div style="font-size:11px;color:#94a3b8;">📈 Trading Income</div>' +
                  '<div style="font-size:18px;font-weight:bold;color:' + (tradingPerSec >= 0 ? '#06b6d4' : '#ef4444') + ';">' + (tradingPerSec >= 0 ? '+' : '') + '$' + Math.round(tradingPerSec).toLocaleString() + '/sec</div>' +
                  '<div style="font-size:10px;color:#64748b;">Avg over ' + p._tradeCount + ' trades (every 5s)</div>' +
                '</div>' +
                // Last trade detail
                '<div style="background:#1e293b;padding:10px;border-radius:6px;">' +
                  '<div style="font-size:11px;color:#94a3b8;">🔄 Last Trade</div>' +
                  '<div style="font-size:18px;font-weight:bold;color:' + (lastTS === 0 ? '#94a3b8' : tpColor) + ';">' + (lastTS === 0 ? 'Skipped' : tpSign + '$' + Math.round(lastTP).toLocaleString()) + '</div>' +
                  '<div style="font-size:10px;color:#64748b;">' + (lastTS === 0 ? 'Price too low ($' + Math.round(lastTPr) + '/MWh) - waiting' : lastTS + ' MWh @ $' + Math.round(lastTPr) + '/MWh (' + margin.toFixed(0) + '% margin)') + '</div>' +
                '</div>' +
                // Frequency income
                '<div style="background:#1e293b;padding:10px;border-radius:6px;">' +
                  '<div style="font-size:11px;color:#94a3b8;">🎯 Frequency Response</div>' +
                  '<div style="font-size:18px;font-weight:bold;color:#fbbf24;">' + (freqPay > 0 ? '+$' + freqPay.toLocaleString() : 'N/A') + '</div>' +
                  '<div style="font-size:10px;color:#64748b;">' + (freqPay > 0 ? 'Last event payout' : 'No SCADA system yet') + '</div>' +
                '</div>' +
              '</div>' +
              // Total estimate
              '<div style="margin-top:8px;padding:8px 12px;background:#1e293b;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:12px;color:#94a3b8;">Estimated Total Income:</span>' +
                '<span style="font-size:20px;font-weight:bold;color:' + (totalPerSec >= 0 ? '#22c55e' : '#ef4444') + ';">~$' + Math.round(totalPerSec).toLocaleString() + '/sec</span>' +
              '</div>' +
            '</div>';
          })() +

          // Markets & Grids
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div style="background:#1e293b;padding:16px;border-radius:8px;border:1px solid #a78bfa30;">' +
              '<div style="font-weight:bold;color:#a78bfa;margin-bottom:8px;">📊 Active Markets</div>' +
              markets.map(function(m) { return '<div style="font-size:12px;color:#cbd5e1;padding:2px 0;">• ' + m + '</div>'; }).join('') +
            '</div>' +
            '<div style="background:#1e293b;padding:16px;border-radius:8px;border:1px solid #06b6d430;">' +
              '<div style="font-weight:bold;color:#06b6d4;margin-bottom:8px;">⚡ Connected Grids (' + grids.length + '/5)</div>' +
              (gridCards || '<div style="font-size:12px;color:#6b7280;">No grids connected yet</div>') +
            '</div>' +
          '</div>' +

          // Footer metrics
          '<div style="margin-top:16px;background:#0f172a;padding:12px 16px;border-radius:8px;display:flex;gap:24px;flex-wrap:wrap;font-size:11px;color:#64748b;">' +
            '<span>Cycles: ' + p._cycleCount + '</span>' +
            '<span>Fast FR: ' + p._fastFrequencyResponses + '</span>' +
            '<span>Risk: ' + p._riskTolerance + '%</span>' +
            '<span>Phase 3 Progress: ' + p._getCompletionPct(gs) + '%</span>' +
          '</div>' +
        '</div>';
      },
    });

    console.log('[Phase3] Initialized successfully.');
  }

  // === HELPER: Completion percentage ===
  static _getCompletionPct(gs) {
    var score = 0;
    if ((gs.resources.mwhTraded || 0) >= 100000) score += 20;
    else score += Math.floor(((gs.resources.mwhTraded || 0) / 100000) * 20);
    if ((gs.resources.algorithmScore || 0) >= 70) score += 20;
    else score += Math.floor(((gs.resources.algorithmScore || 0) / 70) * 20);
    if ((gs.resources.frequencyCredits || 0) >= 500) score += 20;
    else score += Math.floor(((gs.resources.frequencyCredits || 0) / 500) * 20);
    if (this._connectedGrids.length >= 5) score += 20;
    else score += this._connectedGrids.length * 4;
    if ((gs.resources.carbonCredits || 0) >= 1000) score += 20;
    else score += Math.floor(((gs.resources.carbonCredits || 0) / 1000) * 20);
    return Math.min(100, score);
  }

  // === HELPER: Get algorithm grade letter ===
  static _getGrade(score) {
    if (score >= 95) return 'S';
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    if (score >= 25) return 'D';
    return 'F';
  }

  // === HELPER: Calculate revenue multiplier from active markets ===
  static _getMarketMultiplier(pd) {
    var mult = 1.0; // Day-ahead is always active
    if (pd.upgrade_market_realtime) mult += 0.5;
    if (pd.upgrade_market_frequency) mult += 2.0;
    if (pd.upgrade_market_voltage) mult += 1.0;
    if (pd.upgrade_market_blackstart) mult += 4.0;
    if (pd.upgrade_market_demand_response) mult += 1.5;
    return mult;
  }

  // === HELPER: Get frequency response tier (0-4) ===
  static _getFreqTier(pd) {
    if (pd.upgrade_freq_quantum) return 4;
    if (pd.upgrade_freq_hardware) return 3;
    if (pd.upgrade_freq_plc) return 2;
    if (pd.upgrade_freq_scada) return 1;
    return 0;
  }

  // === PRICE SIMULATION ===
  static _simulatePrice(tickCount) {
    // 720 ticks = 1 game day (12 minutes real time)
    var gameHour = (tickCount % 720) / 30; // 0-24
    var basePrice;

    // Time-of-day price curve
    if (gameHour < 6) basePrice = 25;          // 0-6: cheap night
    else if (gameHour < 9) basePrice = 80;     // 6-9: morning ramp
    else if (gameHour < 15) basePrice = 60;    // 9-15: midday
    else if (gameHour < 20) basePrice = 180;   // 15-20: peak!
    else if (gameHour < 23) basePrice = 70;    // 20-23: evening
    else basePrice = 30;                        // 23-24: night

    // Add noise +-30%
    var noise = (Math.random() - 0.5) * 0.6 * basePrice;
    var price = Math.max(5, basePrice + noise);

    return Math.round(price * 100) / 100;
  }

  // === MAIN TICK ===
  static onTick(gameState, deltaTime) {
    if (gameState.batteries < 100000) return;
    if ((gameState.resources.gridAccessTokens || 0) < 3) return;

    var pd = gameState.pluginData;
    this._tickCounter++;

    // === UNLOCK ANNOUNCEMENT ===
    if (!this._unlockFired) {
      this._unlockFired = true;
      gameState.events = [{
        text: "📈 Phase 3 Unlocked: The Grid Integration Wars! Your batteries are now financial instruments. Check the Trading tab!",
        time: Date.now()
      }, ...gameState.events.slice(0, 9)];
    }

    // === PRICE SIMULATION ===
    this._currentPrice = this._simulatePrice(this._tickCounter);
    this._priceHistory.push(this._currentPrice);
    if (this._priceHistory.length > 60) this._priceHistory.shift();

    // === FLASH CRASH EVENT ===
    if (this._flashCrashActive) {
      this._flashCrashTicks++;
      if (this._flashCrashTicks >= 5) {
        this._flashCrashActive = false;
        this._currentPrice = this._simulatePrice(this._tickCounter); // recover
        gameState.events = [{
          text: "📈 Flash crash over. Markets recovering. Your heart rate? Not yet.",
          time: Date.now()
        }, ...gameState.events.slice(0, 9)];
      } else {
        this._currentPrice = Math.max(2, this._currentPrice * 0.1); // price crashes
      }
    }

    // === POLAR VORTEX ===
    if (this._polarVortexStage > 0) {
      this._polarVortexTicks++;
      if (this._polarVortexStage === 1 && this._polarVortexTicks >= 30) {
        this._polarVortexStage = 2;
        gameState.events = [{ text: "🥶 Polar Vortex Stage 2: Emergency declared! Prices at 500x normal!", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }
      if (this._polarVortexStage === 2 && this._polarVortexTicks >= 90) {
        this._polarVortexStage = 3;
        gameState.resources.gridStability = Math.max(0, (gameState.resources.gridStability || 50) - 30);
        gameState.events = [{ text: "🥶 Polar Vortex Stage 3: CRITICAL SHORTAGE. Grid stability at " + Math.round(gameState.resources.gridStability) + "!", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }
      if (this._polarVortexStage === 3 && this._polarVortexTicks >= 180) {
        this._polarVortexStage = 0;
        this._polarVortexTicks = 0;
        gameState.resources.gridStability = Math.min(100, (gameState.resources.gridStability || 50) + 20);
        gameState.events = [{ text: "🌡️ Polar vortex ending. Prices normalizing. We survived. Barely.", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }
      if (this._polarVortexStage >= 2) {
        this._currentPrice = Math.max(this._currentPrice, 500 + Math.random() * 500);
      }
    }

    // === SOLAR FLOOD ===
    if (this._solarFloodActive) {
      this._solarFloodTicks++;
      this._currentPrice = -50 + Math.random() * 30; // negative prices!
      gameState.resources.carbonCredits = (gameState.resources.carbonCredits || 0) + 0.5;
      if (this._solarFloodTicks >= 60) {
        this._solarFloodActive = false;
        this._solarFloodTicks = 0;
        gameState.events = [{ text: "☀️ Solar flood ended. Prices recovering. Hope you charged up!", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }
    }

    // === FIRMWARE BUG ===
    if (this._firmwareBugActive) {
      this._firmwareBugTicks++;
      if (this._firmwareBugTicks >= 300) { // auto-fix after 5 min
        this._firmwareBugActive = false;
        gameState.events = [{ text: "🐛 Firmware bug auto-patched. Only cost you... some money.", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }
    }

    // === CYBER BREACH ===
    if (this._cyberBreachActive) {
      this._cyberBreachTicks++;
      gameState.money -= 1000; // ongoing losses
      if (this._cyberBreachTicks >= 120) {
        this._cyberBreachActive = false;
        gameState.events = [{ text: "🔒 Cybersecurity breach contained. Changed password from 'admin'. Lesson learned.", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }
    }

    // === FREQUENCY BAN COUNTDOWN ===
    if (this._frequencyBanned) {
      this._frequencyBanTicks++;
      if (this._frequencyBanTicks >= 720) { // 1 game-day ban
        this._frequencyBanned = false;
        this._frequencyBanTicks = 0;
        this._frequencyMissStreak = 0;
        gameState.events = [{ text: "🎯 Frequency market ban lifted. Don't miss again.", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }
    }

    // === AUTOMATED TRADING (core revenue loop) ===
    var algoScore = gameState.resources.algorithmScore || 30;
    var marketMult = this._getMarketMultiplier(pd);
    var gridsConnected = this._connectedGrids.length;

    if (gridsConnected > 0) {
      // Trade every 5 ticks (~5 seconds)
      if (this._tickCounter % 5 === 0) {
        var efficiency = algoScore / 100;
        var tradeSize = gridsConnected * 2; // MWh per trade

        // Revenue: sell MWh at market price with a margin based on algo skill
        // margin = 5% base + up to 20% more from algorithm quality
        var margin = 0.05 + efficiency * 0.20;

        // Operating costs: grid fees + battery wear ($2/MWh base)
        var operatingCost = tradeSize * 2 * (1 + this._batteryDegradation / 50);

        // Smart trading: check if price is worth trading at
        // Better algorithms are better at knowing when NOT to trade
        var expectedRevenue = tradeSize * this._currentPrice * margin * marketMult;
        var skipChance = 0.1 + efficiency * 0.7; // algo 30: 31% skip, algo 100: 80% skip
        var shouldSkip = expectedRevenue < operatingCost && Math.random() < skipChance;

        if (!shouldSkip) {
          var tradeRevenue = tradeSize * this._currentPrice * margin;

          // Market multiplier from unlocked markets
          tradeRevenue *= marketMult;

          // Firmware bug: 10% chance trades execute backwards (loss)
          var firmwarePenalty = this._firmwareBugActive && Math.random() < 0.1 ? -1 : 1;
          tradeRevenue *= firmwarePenalty;

          // Risk factor: higher algo = more consistent results
          var luckFactor = (Math.random() - 0.4) * (1 - efficiency * 0.7);
          tradeRevenue *= (1 + luckFactor);

          var tradeProfit = tradeRevenue - operatingCost;

          // Apply trade
          gameState.money += tradeProfit;
          gameState.resources.mwhTraded = (gameState.resources.mwhTraded || 0) + tradeSize;
          this._tradeCount++;
          this._totalTradeProfit += tradeProfit;
          if (tradeProfit > 0) this._profitableTradeCount++;
          this._cycleCount++;
          this._lastTradeProfit = tradeProfit;
          this._lastTradeRevenue = tradeRevenue;
          this._lastTradePrice = this._currentPrice;
          this._lastTradeSize = tradeSize;
          // Battery degradation increases slowly over time
          this._batteryDegradation += 0.001 * tradeSize;

          // Track daily profit
          this._dayProfitAccumulator += tradeProfit;

          // Carbon credits from clean energy trading
          gameState.resources.carbonCredits = (gameState.resources.carbonCredits || 0) + tradeSize * 0.05;
        } else {
          // Algorithm decided to skip - record it
          this._lastTradeProfit = 0;
          this._lastTradeRevenue = 0;
          this._lastTradePrice = this._currentPrice;
          this._lastTradeSize = 0;
        }
      }
    }

    // === DAY TRACKING (every 720 ticks) ===
    this._dayTickCounter++;
    if (this._dayTickCounter >= 720) {
      this._dayTickCounter = 0;
      if (this._dayProfitAccumulator > 0) {
        this._consecutiveProfitDays++;
      } else {
        this._consecutiveProfitDays = 0;
      }
      this._dayProfitAccumulator = 0;
    }

    // === FREQUENCY RESPONSE EVENTS ===
    if (!this._frequencyBanned) {
      this._frequencyEventCooldown--;
      var freqTier = this._getFreqTier(pd);

      if (freqTier > 0 && this._frequencyEventCooldown <= 0) {
        // Frequency event! Interval based on tier
        var interval = Math.max(10, 60 - freqTier * 12);
        this._frequencyEventCooldown = interval + Math.floor(Math.random() * 20);

        this._totalFrequencyEvents++;
        var responseChance = 0.3 + freqTier * 0.17; // tier 1: 47%, tier 4: 98%
        var success = Math.random() < responseChance;

        if (success) {
          var isFast = Math.random() < (freqTier * 0.2); // higher tier = more fast responses
          var credits = isFast ? 10 : 5;
          var payment = isFast ? 5000 : 2000;
          gameState.resources.frequencyCredits = (gameState.resources.frequencyCredits || 0) + credits;
          gameState.money += payment;
          gameState.resources.gridStability = Math.min(100, (gameState.resources.gridStability || 50) + 1);
          this._frequencyMissStreak = 0;
          this._lastFrequencyPayment = payment;
          if (isFast) this._fastFrequencyResponses++;
        } else {
          gameState.resources.frequencyCredits = Math.max(0, (gameState.resources.frequencyCredits || 0) - 15);
          gameState.resources.gridStability = Math.max(0, (gameState.resources.gridStability || 50) - 3);
          this._frequencyMissStreak++;

          if (this._frequencyMissStreak >= 3) {
            this._frequencyBanned = true;
            this._frequencyBanTicks = 0;
            gameState.events = [{
              text: "🚫 Missed 3 frequency events in a row! Kicked from FR market for 24 game-hours.",
              time: Date.now()
            }, ...gameState.events.slice(0, 9)];
          }
        }
      }
    }

    // === GRID STABILITY NATURAL DRIFT ===
    gameState.resources.gridStability = Math.max(0, Math.min(100,
      (gameState.resources.gridStability || 50) + (Math.random() - 0.5) * 2
    ));

    // Grid stability bonus from more connected grids
    if (gridsConnected >= 3) {
      gameState.resources.gridStability = Math.min(100,
        (gameState.resources.gridStability || 50) + 0.1 * gridsConnected
      );
    }

    // === GRID RELATIONSHIP DRIFT ===
    if (this._tickCounter % 60 === 0) { // every minute
      for (var gid in this._gridRelationships) {
        // Small random drift
        this._gridRelationships[gid] += (Math.random() - 0.5) * 2;
        this._gridRelationships[gid] = Math.max(-50, Math.min(50, this._gridRelationships[gid]));
      }
    }

    // === RANDOM MARKET EVENTS ===
    if (this._tickCounter % 10 === 0 && gridsConnected > 0) {
      var eventRoll = Math.random();

      // Flash Crash (0.5% per 10 ticks)
      if (eventRoll < 0.005 && !this._flashCrashActive && pd.upgrade_market_realtime) {
        this._flashCrashActive = true;
        this._flashCrashTicks = 0;
        var selling = Math.random() < 0.5;
        if (selling) {
          var loss = 100000 + Math.floor(Math.random() * 400000);
          gameState.money -= loss;
          gameState.events = [{ text: "📉 FLASH CRASH! You were selling. Lost $" + loss.toLocaleString() + " as prices hit the floor.", time: Date.now() }, ...gameState.events.slice(0, 9)];
        } else {
          var gain = 200000 + Math.floor(Math.random() * 800000);
          gameState.money += gain;
          gameState.events = [{ text: "📈 FLASH CRASH! You bought the dip! Gained $" + gain.toLocaleString() + "!", time: Date.now() }, ...gameState.events.slice(0, 9)];
        }
      }

      // Polar Vortex (0.3% per 10 ticks)
      if (eventRoll > 0.995 && this._polarVortexStage === 0 && !this._flashCrashActive) {
        this._polarVortexStage = 1;
        this._polarVortexTicks = 0;
        gameState.events = [{ text: "🥶 POLAR VORTEX INCOMING! Temperature dropping. Prices starting to rise...", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }

      // Solar Flood (0.8% per 10 ticks)
      if (eventRoll > 0.99 && eventRoll <= 0.998 && !this._solarFloodActive && !this._flashCrashActive) {
        this._solarFloodActive = true;
        this._solarFloodTicks = 0;
        gameState.events = [{ text: "☀️ SOLAR FLOOD! Negative prices! You get PAID to charge! Go go go!", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }

      // Firmware Bug (0.3% per 10 ticks, requires advanced algo)
      if (eventRoll > 0.003 && eventRoll < 0.006 && !this._firmwareBugActive && pd.upgrade_algo_ml) {
        this._firmwareBugActive = true;
        this._firmwareBugTicks = 0;
        gameState.events = [{ text: "🐛 INVERTER FIRMWARE BUG! Race condition detected. 10% of trades executing backwards!", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }

      // Cybersecurity Breach (0.2% per 10 ticks, requires 3+ market connections)
      if (eventRoll > 0.006 && eventRoll < 0.008 && !this._cyberBreachActive && gridsConnected >= 3) {
        this._cyberBreachActive = true;
        this._cyberBreachTicks = 0;
        gameState.money -= 200000; // immediate audit cost
        for (var g in this._gridRelationships) {
          this._gridRelationships[g] -= 10;
        }
        gameState.events = [{ text: "🔓 CYBERSECURITY BREACH! Hackers in your BMS! -$200k audit + ongoing losses. Password was 'admin'.", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }

      // Rolling Blackout (when grid stability is low)
      if ((gameState.resources.gridStability || 50) < 25 && Math.random() < 0.1 && pd.upgrade_market_blackstart) {
        gameState.money += 1000000;
        gameState.resources.gridStability = Math.min(100, (gameState.resources.gridStability || 50) + 30);
        this._blackStartPerformed = true;
        for (var g2 in this._gridRelationships) {
          this._gridRelationships[g2] += 15;
        }
        gameState.events = [{ text: "🌑 ROLLING BLACKOUT! Black start activated! You saved the grid. +$1M, +relationships!", time: Date.now() }, ...gameState.events.slice(0, 9)];
      }

      // Flavor events (2% per 10 ticks)
      if (eventRoll > 0.01 && eventRoll < 0.03) {
        var flavors = [
          "💰 Bought at $20, sold at $180. You're a genius!",
          "📉 Algorithm confused by daylight savings time. Sold at a loss for an hour.",
          "🤖 Your quant bot sent a Slack message: 'I need more data.' That's... new.",
          "⚡ Grid operator called to say thanks. That's a first.",
          "📊 Investor asked what your Sharpe ratio is. You said 'pretty sharp.' They were not amused.",
          "🏛️ FERC regulator dropped by. Just to 'say hi.' You're not nervous at all.",
          "☕ Trading floor coffee machine broke. Productivity dropped 40%.",
          "🔧 Battery cell #4,728 is 'acting funny.' Define funny. 'It's warm.' How warm? '...very.'",
          "📈 Your algorithm accidentally cornered the market for 0.3 seconds. Nobody noticed. Probably.",
        ];
        gameState.events = [{
          text: flavors[Math.floor(Math.random() * flavors.length)],
          time: Date.now()
        }, ...gameState.events.slice(0, 9)];
      }
    }

    // === SEC INVESTIGATION (algo score too high) ===
    if ((gameState.resources.algorithmScore || 0) >= 95 && Math.random() < 0.001) {
      gameState.money -= 500000;
      gameState.events = [{
        text: "🏛️ SEC investigation opened! 'Suspiciously good' trading. Lawyers: $500k. They found nothing. (This time.)",
        time: Date.now()
      }, ...gameState.events.slice(0, 9)];
    }

    // === INVESTOR CONFIDENCE from grid participation ===
    if (gridsConnected >= 3 && gameState.resources.investorConfidence !== undefined) {
      gameState.resources.investorConfidence = Math.min(100,
        (gameState.resources.investorConfidence || 50) + 0.02 * gridsConnected
      );
    }

    // === ACHIEVEMENTS ===
    this._checkAchievements(gameState);
  }

  // === ACHIEVEMENTS ===
  static _checkAchievements(gs) {
    var a = gs.achievements || [];
    var hasAch = function(id) { return a.some(function(x) { return x.id === id; }); };
    var addAch = function(id, name, desc) {
      if (!hasAch(id)) {
        gs.achievements = [{ id: id, name: name, description: desc }, ...a];
        gs.events = [{ text: '🏆 Achievement: ' + name, time: Date.now() }, ...gs.events.slice(0, 9)];
        a = gs.achievements;
      }
    };

    if (this._tradeCount >= 1 && !hasAch('first_trade')) {
      addAch('first_trade', 'First Trade', "You're a trader now. Sort of.");
      gs.money += 10000;
    }
    if (this._tradeCount >= 1000 && !hasAch('day_trader')) {
      addAch('day_trader', 'Day Trader', 'Buy low, sell high. Repeat forever.');
    }
    if (this._flashCrashActive === false && this._tradeCount > 100 && !hasAch('flash_survivor')) {
      // Only award after surviving a flash crash
      if (this._priceHistory.some(function(p) { return p < 10; })) {
        addAch('flash_survivor', 'Flash Crash Survivor', 'You kept your cool when algorithms panicked.');
        gs.money += 100000;
      }
    }
    if (this._fastFrequencyResponses >= 100 && !hasAch('freq_sniper')) {
      addAch('freq_sniper', 'Frequency Sniper', 'Your reflexes are... concerning.');
      gs.resources.frequencyCredits = (gs.resources.frequencyCredits || 0) + 50;
    }
    if ((gs.resources.gridStability || 0) >= 80 && !hasAch('grid_stabilizer')) {
      addAch('grid_stabilizer', 'Grid Stabilizer', "You're holding the grid together.");
      gs.money += 500000;
    }
    if (this._blackStartPerformed && !hasAch('blackstart_hero')) {
      addAch('blackstart_hero', 'Black Start Hero', 'When everything went dark, you brought the light.');
      gs.money += 2000000;
    }
    if ((gs.resources.algorithmScore || 0) >= 95 && !hasAch('algo_god')) {
      addAch('algo_god', 'Algorithm God', 'The SEC wants to talk to you.');
    }
    if ((gs.resources.carbonCredits || 0) >= 1000 && !hasAch('carbon_neutral')) {
      addAch('carbon_neutral', 'Carbon Neutral', "You're saving the planet! (Allegedly)");
      if (gs.resources.investorConfidence !== undefined) {
        gs.resources.investorConfidence = Math.min(100, gs.resources.investorConfidence + 20);
      }
    }
    if (this._consecutiveProfitDays >= 7 && !hasAch('perfect_week')) {
      addAch('perfect_week', 'Perfect Week', 'Skill or luck? Who cares, you\'re rich.');
      gs.money += 1000000;
    }
    if (this._connectedGrids.length >= 5 && !hasAch('grid_master')) {
      addAch('grid_master', 'Grid Master', 'Connected to all major RTOs. The power is yours.');
    }
  }

  // === SAVE ===
  static onBeforeSave(saveData) {
    saveData.pluginData = saveData.pluginData || {};
    saveData.pluginData.phase3 = {
      tickCounter: this._tickCounter,
      priceHistory: this._priceHistory.slice(-30),
      currentPrice: this._currentPrice,
      tradeCount: this._tradeCount,
      profitableTradeCount: this._profitableTradeCount,
      totalTradeProfit: this._totalTradeProfit,
      consecutiveProfitDays: this._consecutiveProfitDays,
      dayProfitAccumulator: this._dayProfitAccumulator,
      dayTickCounter: this._dayTickCounter,
      flashCrashActive: this._flashCrashActive,
      polarVortexStage: this._polarVortexStage,
      polarVortexTicks: this._polarVortexTicks,
      solarFloodActive: this._solarFloodActive,
      solarFloodTicks: this._solarFloodTicks,
      firmwareBugActive: this._firmwareBugActive,
      firmwareBugTicks: this._firmwareBugTicks,
      cyberBreachActive: this._cyberBreachActive,
      cyberBreachTicks: this._cyberBreachTicks,
      flashCrashTicks: this._flashCrashTicks,
      frequencyMissStreak: this._frequencyMissStreak,
      frequencyBanned: this._frequencyBanned,
      frequencyBanTicks: this._frequencyBanTicks,
      totalFrequencyEvents: this._totalFrequencyEvents,
      fastFrequencyResponses: this._fastFrequencyResponses,
      connectedGrids: this._connectedGrids,
      gridRelationships: this._gridRelationships,
      batteryDegradation: this._batteryDegradation,
      cycleCount: this._cycleCount,
      riskTolerance: this._riskTolerance,
      blackStartPerformed: this._blackStartPerformed,
      unlockFired: this._unlockFired,
    };
  }

  // === LOAD ===
  static onAfterLoad(saveData, gameState) {
    var d = (saveData.pluginData && saveData.pluginData.phase3) ? saveData.pluginData.phase3 : null;
    if (!d) return;

    this._tickCounter = d.tickCounter || 0;
    this._priceHistory = d.priceHistory || [];
    this._currentPrice = d.currentPrice || 50;
    this._tradeCount = d.tradeCount || 0;
    this._profitableTradeCount = d.profitableTradeCount || 0;
    this._totalTradeProfit = d.totalTradeProfit || 0;
    this._consecutiveProfitDays = d.consecutiveProfitDays || 0;
    this._dayProfitAccumulator = d.dayProfitAccumulator || 0;
    this._dayTickCounter = d.dayTickCounter || 0;
    this._flashCrashActive = d.flashCrashActive || false;
    this._flashCrashTicks = d.flashCrashTicks || 0;
    this._polarVortexStage = d.polarVortexStage || 0;
    this._polarVortexTicks = d.polarVortexTicks || 0;
    this._solarFloodActive = d.solarFloodActive || false;
    this._solarFloodTicks = d.solarFloodTicks || 0;
    this._firmwareBugActive = d.firmwareBugActive || false;
    this._firmwareBugTicks = d.firmwareBugTicks || 0;
    this._cyberBreachActive = d.cyberBreachActive || false;
    this._cyberBreachTicks = d.cyberBreachTicks || 0;
    this._frequencyMissStreak = d.frequencyMissStreak || 0;
    this._frequencyBanned = d.frequencyBanned || false;
    this._frequencyBanTicks = d.frequencyBanTicks || 0;
    this._totalFrequencyEvents = d.totalFrequencyEvents || 0;
    this._fastFrequencyResponses = d.fastFrequencyResponses || 0;
    this._connectedGrids = d.connectedGrids || [];
    this._gridRelationships = d.gridRelationships || { caiso: 0, pjm: 20, ercot: -10, miso: 0, nyiso: -5 };
    this._batteryDegradation = d.batteryDegradation || 0;
    this._cycleCount = d.cycleCount || 0;
    this._riskTolerance = d.riskTolerance || 30;
    this._blackStartPerformed = d.blackStartPerformed || false;
    this._unlockFired = d.unlockFired || false;
  }

  static cleanup() {
    console.log('[Phase3] Cleaning up...');
    this._tickCounter = 0;
    this._priceHistory = [];
    this._connectedGrids = [];
  }
}

if (typeof PluginRegistry !== 'undefined') {
  PluginRegistry.register(Phase3GridWarsPlugin);
}
