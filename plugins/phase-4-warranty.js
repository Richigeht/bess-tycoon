class Phase4WarrantyPlugin {
  static manifest = {
    id: 'phase-4-warranty',
    name: 'Warranty Claim Siege',
    version: '1.0.0',
    author: 'BESS Tycoon Team',
    description: 'Field failures, customer claims, RMA decisions, and weaponized fine print.',
    unlockCondition: state => state.batteries >= 10000,
    unlockHint: 'Reach 10,000 batteries',
    dependencies: ['phase-2-scale-up'],
    conflicts: [],
  };

  static causes = [
    'Cell imbalance',
    'BMS reboot loop',
    'Inverter fault',
    'Thermal event',
    'Capacity below warranty',
  ];

  static init(gameEngine) {
    gameEngine.addResource({
      id: 'customerTrust',
      name: 'Customer Trust',
      icon: '🤝',
      startValue: 70,
      min: 0,
      max: 100,
      displayPrecision: 0,
      tooltip: 'How many customers still believe the warranty PDF.',
    });

    gameEngine.addUpgrade({
      id: 'warranty_rma',
      name: 'Hire RMA Specialist',
      description: 'Reduce honored claim payouts by 10%, capped at 50%.',
      category: 'warranty',
      cost: { money: 75000 },
      effect: state => this._event(state, '📦 An RMA specialist found a cheaper return label.'),
      unlockCondition: state => state.batteries >= 10000,
      oneTime: false,
    });

    gameEngine.addUpgrade({
      id: 'warranty_triage',
      name: 'Automated Claim Triage',
      description: 'Protect the first three overdue claims from trust loss.',
      category: 'warranty',
      cost: { money: 250000 },
      effect: state => this._event(state, '🗂️ The triage desk prioritized three folders.'),
      unlockCondition: state => state.batteries >= 10000,
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'warranty_lab',
      name: 'Root-Cause Analysis Lab',
      description: 'Halve the chance of new warranty claims.',
      category: 'warranty',
      cost: { money: 750000 },
      effect: state => this._event(state, '🔬 The lab can now reproduce failures on purpose.'),
      unlockCondition: state => state.batteries >= 10000,
      oneTime: true,
    });

    gameEngine.addAction('warranty-honor', (state, payload) => this._resolve(state, payload.claimId, (next, claim, data) => {
      const specialists = state.pluginData.upgrade_count_warranty_rma || 0;
      const payoutMultiplier = Math.max(0.5, 1 - specialists * 0.1);
      const payout = Math.round(claim.payout * payoutMultiplier);
      if (next.money < payout) {
        this._event(next, '💸 Insufficient cash to honor claim #' + claim.id + '.');
        return false;
      }
      next.money -= payout;
      this._trust(next, 4);
      data.honored++;
      this._event(next, '✅ Claim #' + claim.id + ' honored for $' + payout.toLocaleString() + '.');
      return true;
    }));

    gameEngine.addAction('warranty-deny', (state, payload) => this._resolve(state, payload.claimId, (next, claim, data) => {
      next.techDebt += 10;
      this._trust(next, -8);
      if (next.resources.investorConfidence !== undefined) {
        next.resources.investorConfidence = Math.max(0, next.resources.investorConfidence - 5);
      }
      data.denied++;
      this._event(next, '📄 Claim #' + claim.id + ' denied under subsection 47(b).');
      return true;
    }));

    gameEngine.addAction('warranty-vendor', (state, payload) => this._resolve(state, payload.claimId, (next, claim, data) => {
      if (claim.vendorCovered) {
        this._trust(next, 2);
        data.vendorWins++;
        this._event(next, '🏭 Vendor accepted claim #' + claim.id + '. Miracles happen.');
      } else {
        next.money -= Math.round(claim.payout * 1.5);
        this._trust(next, -4);
        if (next.resources.investorConfidence !== undefined) {
          next.resources.investorConfidence = Math.max(0, next.resources.investorConfidence - 3);
        }
        this._event(next, '⚖️ Vendor rejected claim #' + claim.id + '; legal fees applied.');
      }
      return true;
    }));

    gameEngine.addTab({
      id: 'warranty',
      name: 'Warranty',
      icon: '🛡️',
      unlockCondition: state => state.batteries >= 10000,
      render: gameState => this._render(gameState),
    });

    gameEngine.on('calculateProduction', state => {
      const trust = state.resources.customerTrust ?? 70;
      if (trust < 30) state.multipliers.productionSpeed *= 0.75;
      else if (trust > 80) state.multipliers.productionSpeed *= 1.05;
    });
  }

  static _data(state) {
    state.pluginData.warranty ??= {
      nextClaimId: 1,
      claims: [],
      filed: 0,
      honored: 0,
      denied: 0,
      vendorWins: 0,
      tick: 0,
    };
    return state.pluginData.warranty;
  }

  static _event(state, text) {
    state.events = [{ text, time: Date.now() }, ...(state.events || []).slice(0, 9)];
  }

  static _trust(state, amount) {
    state.resources.customerTrust = Math.max(0, Math.min(100, (state.resources.customerTrust ?? 70) + amount));
  }

  static _risk(state) {
    let risk = 0.10 + Math.min(0.40, state.techDebt / 1000);
    if (state.upgrades.skipTesting) risk += 0.15;
    if (state.upgrades.ignoreCerts) risk += 0.20;
    if (state.pluginData.upgrade_warranty_lab) risk *= 0.5;
    return Math.min(0.90, risk);
  }

  static _resolve(state, claimId, apply) {
    const source = state.pluginData.warranty;
    const claimIndex = source?.claims.findIndex(claim => claim.id === claimId) ?? -1;
    if (claimIndex < 0) return state;

    const data = { ...source, claims: [...source.claims] };
    const next = {
      ...state,
      resources: { ...state.resources },
      pluginData: { ...state.pluginData, warranty: data },
      events: [...state.events],
    };
    if (apply(next, data.claims[claimIndex], data)) data.claims.splice(claimIndex, 1);
    return next;
  }

  static onTick(state) {
    if (state.batteries < 10000) return;
    const data = this._data(state);
    data.tick++;
    for (const claim of data.claims) claim.age++;

    const overdue = data.claims.filter(claim => claim.age > 0 && claim.age % 60 === 0);
    const unprotected = state.pluginData.upgrade_warranty_triage ? overdue.slice(3) : overdue;
    if (unprotected.length) this._trust(state, -unprotected.length);

    if (data.tick % 30 || Math.random() >= this._risk(state)) return;
    const cause = this.causes[Math.floor(Math.random() * this.causes.length)];
    const payout = Math.min(50000, 5000 + Math.floor(state.batteriesPerSecond * 100));
    const claim = {
      id: data.nextClaimId++,
      cause,
      payout,
      age: 0,
      vendorCovered: Math.random() < 0.45,
    };
    data.claims.push(claim);
    data.filed++;
    this._event(state, '🛡️ Claim #' + claim.id + ' filed: ' + claim.cause + ' ($' + claim.payout.toLocaleString() + ').');
  }

  static _render(gameState) {
    const data = this._data(gameState);
    const number = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
    const trust = number(gameState.resources.customerTrust, 70);
    const production = trust < 30 ? '-25%' : trust > 80 ? '+5%' : 'Normal';
    const risk = Math.round(this._risk(gameState) * 100);
    const claimCards = data.claims.map(claim => {
      const specialists = gameState.pluginData.upgrade_count_warranty_rma || 0;
      const claimId = number(claim.id);
      const age = number(claim.age);
      const adjustedPayout = Math.round(number(claim.payout) * Math.max(0.5, 1 - specialists * 0.1));
      const cause = this.causes.includes(claim.cause) ? claim.cause : 'Field failure';
      return '<article style="background:#1e293b;border:1px solid #475569;border-radius:8px;padding:16px">' +
        '<h3 style="color:white;margin:0 0 6px">Claim #' + claimId + ': ' + cause + '</h3>' +
        '<p style="color:#94a3b8">Age: ' + age + ' ticks · Exposure: $' + adjustedPayout.toLocaleString() + '</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button data-game-action="warranty-honor" data-claim-id="' + claimId + '"' +
            (gameState.money < adjustedPayout ? ' disabled' : '') + '>Honor claim</button>' +
          '<button data-game-action="warranty-deny" data-claim-id="' + claimId + '">Deny claim</button>' +
          '<button data-game-action="warranty-vendor" data-claim-id="' + claimId + '">Blame vendor</button>' +
        '</div>' +
      '</article>';
    }).join('');

    return '<section style="font-family:system-ui,sans-serif;display:grid;gap:16px">' +
      '<header style="background:#1e293b;border:1px solid #f9731655;border-radius:12px;padding:24px">' +
        '<h2 style="color:#fb923c;margin:0">🛡️ Warranty Claim Siege</h2>' +
        '<p style="color:#94a3b8;margin:6px 0 0">The sales promise survived contact with the field.</p>' +
      '</header>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">' +
        '<div>Customer trust: <strong>' + trust + '</strong></div>' +
        '<div>Production: <strong>' + production + '</strong></div>' +
        '<div>Claim risk: <strong>' + risk + '%</strong></div>' +
        '<div>Open: <strong>' + data.claims.length + '</strong></div>' +
        '<div>Honored: <strong>' + number(data.honored) + '</strong></div>' +
        '<div>Denied: <strong>' + number(data.denied) + '</strong></div>' +
        '<div>Vendor wins: <strong>' + number(data.vendorWins) + '</strong></div>' +
      '</div>' +
      '<p style="color:#94a3b8;margin:0">Hire RMA specialists for payout discounts, triage three overdue claims, and fund the lab to halve new-claim risk.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">' +
        (claimCards || '<p style="color:#94a3b8">No open claims. The inbox is suspiciously quiet.</p>') +
      '</div>' +
    '</section>';
  }
}

if (typeof PluginRegistry !== 'undefined') {
  PluginRegistry.register(Phase4WarrantyPlugin);
}
