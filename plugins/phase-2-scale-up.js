// Phase 2: The Scale-Up Nightmare
// "You've outgrown your garage. Now comes the real pain."
// Unlock: 1,000 batteries produced

class Phase2ScaleUpPlugin {
  static manifest = {
    id: 'phase-2-scale-up',
    name: 'The Scale-Up Nightmare',
    version: '1.0.0',
    author: 'BESS Tycoon Team',
    description: 'Regulatory compliance, investor confidence, certifications, consultants, and insurance nightmares.',
    unlockCondition: function(gameState) { return gameState.batteries >= 1000; },
    unlockHint: 'Reach 1,000 batteries',
    dependencies: [],
    conflicts: [],
  };

  // Track internal timers & state
  static _mckinseyTimer = 0;
  static _mckinseyStage = 0;
  static _auditsSurvived = 0;
  static _lobbyingSpent = 0;
  static _totalClaims = 0;
  static _competitorEventFired = false;
  static _unlockEventFired = false;
  static _complianceOfficers = 0;
  static _lobbyists = 0;
  static _insurancePremiumMultiplier = 1;

  static init(gameEngine) {
    console.log('[Phase2] Initializing The Scale-Up Nightmare...');

    // === RESOURCES ===
    gameEngine.addResource({
      id: 'regulatoryCompliance',
      name: 'Compliance',
      icon: '📋',
      startValue: 0,
      displayPrecision: 0,
      tooltip: 'Measure of how many hoops you\'ve jumped through. The hoops keep moving.',
    });

    gameEngine.addResource({
      id: 'investorConfidence',
      name: 'Investors',
      icon: '💼',
      startValue: 50,
      min: 0,
      max: 100,
      displayPrecision: 0,
      tooltip: 'They believed in you once. Can you keep the dream alive?',
    });

    gameEngine.addResource({
      id: 'gridAccessTokens',
      name: 'Grid Tokens',
      icon: '⚡',
      startValue: 1,
      displayPrecision: 0,
      tooltip: 'Limited licenses to print money. Well, to store and sell electrons.',
    });

    gameEngine.addResource({
      id: 'lobbyingPoints',
      name: 'Lobbying',
      icon: '🏛️',
      startValue: 0,
      displayPrecision: 0,
      tooltip: 'Democracy has a price. A very specific, calculable price.',
    });

    // === CERTIFICATION UPGRADES ===
    gameEngine.addUpgrade({
      id: 'cert_ul1973',
      name: 'UL1973 Certification (USA)',
      description: 'The gold standard. The paperwork weighs 40 lbs. Unlocks US market.',
      category: 'certifications',
      cost: { money: 50000, regulatoryCompliance: 100 },
      effect: function(state) {
        state.certifications = state.certifications || {};
        state.certifications.ul1973 = true;
        state.resources.regulatoryCompliance = (state.resources.regulatoryCompliance || 0) + 50;
      },
      unlockCondition: function(state) { return state.batteries >= 1000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'cert_iec62619',
      name: 'IEC 62619 (Europe)',
      description: '28 countries, 28 different interpretations. Unlocks EU market.',
      category: 'certifications',
      cost: { money: 80000, regulatoryCompliance: 150 },
      effect: function(state) {
        state.certifications.iec62619 = true;
        state.resources.regulatoryCompliance = (state.resources.regulatoryCompliance || 0) + 75;
      },
      unlockCondition: function(state) { return state.certifications && state.certifications.ul1973; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'cert_ce_mark',
      name: 'CE Marking (Europe)',
      description: "It's not a checkmark. It's a 'Conformite Europeenne' marking. Get it right.",
      category: 'certifications',
      cost: { money: 30000, regulatoryCompliance: 80 },
      effect: function(state) {
        state.certifications.ce_mark = true;
        state.resources.regulatoryCompliance = (state.resources.regulatoryCompliance || 0) + 40;
      },
      unlockCondition: function(state) { return state.certifications && state.certifications.iec62619; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'cert_csa_c22',
      name: 'CSA C22.2 (Canada)',
      description: 'Like UL1973 but with bilingual forms. Unlocks Canadian market.',
      category: 'certifications',
      cost: { money: 40000, regulatoryCompliance: 100 },
      effect: function(state) {
        state.certifications.csa_c22 = true;
        state.resources.regulatoryCompliance = (state.resources.regulatoryCompliance || 0) + 50;
      },
      unlockCondition: function(state) { return state.certifications && state.certifications.ul1973; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'cert_un383',
      name: 'UN38.3 (Shipping)',
      description: "Your batteries won't explode on a plane. Probably. Enables international shipping.",
      category: 'certifications',
      cost: { money: 100000, regulatoryCompliance: 200 },
      effect: function(state) {
        state.certifications.un383 = true;
        state.resources.regulatoryCompliance = (state.resources.regulatoryCompliance || 0) + 100;
        state.resources.gridAccessTokens = (state.resources.gridAccessTokens || 0) + 1;
      },
      unlockCondition: function(state) {
        var c = state.certifications || {};
        return c.ul1973 && c.iec62619 && c.ce_mark && c.csa_c22;
      },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'cert_iso9001',
      name: 'ISO 9001 (Quality)',
      description: 'You have processes for your processes now. +25% investor confidence.',
      category: 'certifications',
      cost: { money: 150000, regulatoryCompliance: 250 },
      effect: function(state) {
        state.certifications.iso9001 = true;
        state.resources.investorConfidence = Math.min(100, (state.resources.investorConfidence || 50) + 25);
        state.resources.regulatoryCompliance = (state.resources.regulatoryCompliance || 0) + 100;
      },
      unlockCondition: function(state) { return state.batteries >= 5000; },
      oneTime: true,
    });

    // === CONSULTANT UPGRADES ===
    gameEngine.addUpgrade({
      id: 'hire_mckinsey',
      name: 'Hire McKinsey Consultants',
      description: "They'll tell you what you already know, but now investors believe it. +20 investor confidence.",
      category: 'consulting',
      cost: { money: 500000 },
      effect: function(state) {
        state.resources.investorConfidence = Math.min(100, (state.resources.investorConfidence || 50) + 20);
        Phase2ScaleUpPlugin._mckinseyTimer = 1;
        Phase2ScaleUpPlugin._mckinseyStage = 0;
      },
      unlockCondition: function(state) { return state.batteries >= 2000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'hire_deloitte',
      name: 'Hire Deloitte (Tech Debt Audit)',
      description: '-500 tech debt, +10 investor confidence. Warning: they find MORE issues than they fix.',
      category: 'consulting',
      cost: { money: 300000 },
      effect: function(state) {
        state.techDebt = Math.max(0, state.techDebt - 500);
        state.resources.investorConfidence = Math.min(100, (state.resources.investorConfidence || 50) + 10);
      },
      unlockCondition: function(state) { return state.techDebt >= 50; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'hire_safety_consultant',
      name: 'Safety Consultant',
      description: '-50% incident probability for 180 ticks. Can\'t prevent everything.',
      category: 'consulting',
      cost: { money: 75000 },
      effect: function(state) {
        state.pluginData.safetyConsultantTicks = 180;
      },
      unlockCondition: function(state) { return state.batteries >= 3000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'hire_pr_firm',
      name: 'Hire PR Firm',
      description: '+15 investor confidence. 10% chance of backfire.',
      category: 'consulting',
      cost: { money: 200000 },
      effect: function(state) {
        if (Math.random() < 0.1) {
          state.resources.investorConfidence = Math.max(0, (state.resources.investorConfidence || 50) - 10);
          // backfire event added in onTick
          state.pluginData.prBackfire = true;
        } else {
          state.resources.investorConfidence = Math.min(100, (state.resources.investorConfidence || 50) + 15);
        }
      },
      unlockCondition: function(state) { return state.batteries >= 2000; },
      oneTime: true,
    });

    // === COMPLIANCE OFFICER (repeatable) ===
    gameEngine.addUpgrade({
      id: 'hire_compliance_officer',
      name: 'Hire Compliance Officer',
      description: '+0.5 compliance/sec per officer. Essential for keeping up with regulations.',
      category: 'staffing',
      cost: { money: 25000 },
      effect: function(state) {
        Phase2ScaleUpPlugin._complianceOfficers++;
      },
      unlockCondition: function(state) { return state.batteries >= 1500; },
      oneTime: false,
    });

    // === LOBBYIST (repeatable) ===
    gameEngine.addUpgrade({
      id: 'hire_lobbyist',
      name: 'Hire Lobbyist (Retainer)',
      description: '+1 lobbying point/sec. Occasionally gets caught doing crimes.',
      category: 'staffing',
      cost: { money: 50000 },
      effect: function(state) {
        Phase2ScaleUpPlugin._lobbyists++;
      },
      unlockCondition: function(state) { return state.batteries >= 3000; },
      oneTime: false,
    });

    // === INSURANCE UPGRADES ===
    gameEngine.addUpgrade({
      id: 'insurance_basic',
      name: 'Basic Liability Insurance',
      description: 'The bare minimum. Required for any sales. -$5k/tick ongoing.',
      category: 'insurance',
      cost: { money: 20000 },
      effect: function(state) {
        state.pluginData.insurance_basic = true;
      },
      unlockCondition: function(state) { return state.batteries >= 1000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'insurance_fire',
      name: 'Fire Insurance',
      description: 'Battery fires are... different. Required for >5k batteries. -$15k/tick ongoing.',
      category: 'insurance',
      cost: { money: 50000 },
      effect: function(state) {
        state.pluginData.insurance_fire = true;
      },
      unlockCondition: function(state) { return state.batteries >= 3000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'insurance_cyber',
      name: 'Cyber Insurance',
      description: "Someone WILL hack your BMS. Required for grid connection. -$25k/tick ongoing.",
      category: 'insurance',
      cost: { money: 75000 },
      effect: function(state) {
        state.pluginData.insurance_cyber = true;
      },
      unlockCondition: function(state) { return state.batteries >= 5000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'insurance_dno',
      name: 'D&O Insurance',
      description: 'So you can sleep at night. Required for Series B funding. -$50k/tick ongoing.',
      category: 'insurance',
      cost: { money: 100000 },
      effect: function(state) {
        state.pluginData.insurance_dno = true;
        state.resources.investorConfidence = Math.min(100, (state.resources.investorConfidence || 50) + 10);
      },
      unlockCondition: function(state) { return (state.resources.investorConfidence || 0) >= 40; },
      oneTime: true,
    });

    // === TRADE SHOW UPGRADES ===
    gameEngine.addUpgrade({
      id: 'tradeshow_re_plus',
      name: 'Attend RE+ (Vegas)',
      description: 'The biggest show in clean energy. Also: endless buffets. +1 grid token, +5 investor confidence.',
      category: 'tradeshows',
      cost: { money: 30000 },
      effect: function(state) {
        state.resources.gridAccessTokens = (state.resources.gridAccessTokens || 0) + 1;
        state.resources.investorConfidence = Math.min(100, (state.resources.investorConfidence || 50) + 5);
        state.resources.lobbyingPoints = (state.resources.lobbyingPoints || 0) + 3;
      },
      unlockCondition: function(state) { return state.batteries >= 2000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'tradeshow_ess',
      name: 'Energy Storage Summit (Austin)',
      description: 'Where battery nerds gather. +2 grid tokens, +20 compliance.',
      category: 'tradeshows',
      cost: { money: 20000 },
      effect: function(state) {
        state.resources.gridAccessTokens = (state.resources.gridAccessTokens || 0) + 2;
        state.resources.regulatoryCompliance = (state.resources.regulatoryCompliance || 0) + 20;
      },
      unlockCondition: function(state) { return state.batteries >= 3000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'tradeshow_ces',
      name: 'Attend CES (Vegas)',
      description: 'Batteries at a consumer electronics show? Sure, why not. +20 investor confidence.',
      category: 'tradeshows',
      cost: { money: 50000 },
      effect: function(state) {
        state.resources.investorConfidence = Math.min(100, (state.resources.investorConfidence || 50) + 20);
        state.resources.lobbyingPoints = (state.resources.lobbyingPoints || 0) + 5;
      },
      unlockCondition: function(state) { return state.batteries >= 5000; },
      oneTime: true,
    });

    gameEngine.addUpgrade({
      id: 'tradeshow_local',
      name: 'Local Chamber Breakfast',
      description: 'The schmooze is real. +5 lobbying points, weak local connections.',
      category: 'tradeshows',
      cost: { money: 500 },
      effect: function(state) {
        state.resources.lobbyingPoints = (state.resources.lobbyingPoints || 0) + 5;
      },
      unlockCondition: function(state) { return state.batteries >= 1000; },
      oneTime: true,
    });

    // === LOBBYING UPGRADES ===
    gameEngine.addUpgrade({
      id: 'lobby_favorable_regs',
      name: 'Lobby for Favorable Regulations',
      description: 'Spend lobbying points to boost compliance permanently. +100 compliance.',
      category: 'lobbying',
      cost: { money: 50000, lobbyingPoints: 50 },
      effect: function(state) {
        state.resources.regulatoryCompliance = (state.resources.regulatoryCompliance || 0) + 100;
        Phase2ScaleUpPlugin._lobbyingSpent += 50;
      },
      unlockCondition: function(state) { return (state.resources.lobbyingPoints || 0) >= 50; },
      oneTime: false,
    });

    gameEngine.addUpgrade({
      id: 'lobby_grid_token',
      name: 'Lobby for Grid Access',
      description: 'Trade lobbying clout for a grid access token.',
      category: 'lobbying',
      cost: { lobbyingPoints: 50 },
      effect: function(state) {
        state.resources.gridAccessTokens = (state.resources.gridAccessTokens || 0) + 1;
        Phase2ScaleUpPlugin._lobbyingSpent += 50;
      },
      unlockCondition: function(state) { return (state.resources.lobbyingPoints || 0) >= 50; },
      oneTime: false,
    });

    // === CERTIFICATIONS TAB ===
    gameEngine.addTab({
      id: 'certifications',
      name: 'Certifications',
      icon: '📜',
      unlockCondition: function(gs) { return gs.batteries >= 1000; },
      render: function(gameState) {
        var compliance = (gameState.resources.regulatoryCompliance || 0);
        var confidence = (gameState.resources.investorConfidence || 50);
        var certs = gameState.certifications || {};
        var certCount = Object.values(certs).filter(Boolean).length;

        var complianceColor = compliance >= 80 ? '#22c55e' : compliance >= 50 ? '#eab308' : compliance >= 30 ? '#f97316' : '#ef4444';
        var confidenceColor = confidence >= 85 ? '#60a5fa' : confidence >= 60 ? '#22c55e' : confidence >= 30 ? '#eab308' : '#ef4444';
        var confidenceLabel = confidence >= 85 ? 'Unicorn Status!' : confidence >= 60 ? 'Confident' : confidence >= 30 ? 'Nervous Board Meetings' : 'Vulture VCs Circling';

        function certCard(id, name, region, hasCert) {
          return '<div style="background:' + (hasCert ? '#064e3b' : '#1e293b') + ';border:1px solid ' + (hasCert ? '#22c55e55' : '#33415555') + ';border-radius:8px;padding:16px;text-align:center">'
            + '<div style="font-weight:bold;color:white;font-size:14px">' + name + '</div>'
            + '<div style="color:#9ca3af;font-size:12px;margin:4px 0">' + region + '</div>'
            + '<div style="font-size:18px;margin-top:8px">' + (hasCert ? '✅ Certified' : '❌ Not Certified') + '</div>'
            + '</div>';
        }

        return '<div style="font-family:system-ui,sans-serif">'
          // Header
          + '<div style="background:#1e293b;border:1px solid #a855f755;border-radius:12px;padding:24px;margin-bottom:16px">'
          + '<h2 style="color:#a855f7;font-size:24px;font-weight:bold;margin:0 0 4px 0">📜 The Certification Gauntlet</h2>'
          + '<p style="color:#9ca3af;margin:0">Navigate the bureaucratic nightmare to unlock global markets.</p>'
          + '</div>'

          // Compliance + Confidence meters
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">'
          + '<div style="background:#1e293b;border:1px solid #33415555;border-radius:12px;padding:20px">'
          + '<h3 style="color:#9ca3af;font-size:12px;text-transform:uppercase;margin:0 0 8px 0">📋 Regulatory Compliance</h3>'
          + '<div style="font-size:36px;font-weight:bold;color:' + complianceColor + '">' + Math.floor(compliance) + '</div>'
          + '<div style="background:#0f172a;border-radius:4px;height:8px;margin-top:8px;overflow:hidden"><div style="height:100%;background:' + complianceColor + ';width:' + Math.min(compliance, 100) + '%;transition:width 0.5s"></div></div>'
          + '<p style="color:#6b7280;font-size:11px;margin-top:6px">⚠️ Decays 0.05% per second</p>'
          + '</div>'

          + '<div style="background:#1e293b;border:1px solid #33415555;border-radius:12px;padding:20px">'
          + '<h3 style="color:#9ca3af;font-size:12px;text-transform:uppercase;margin:0 0 8px 0">💼 Investor Confidence</h3>'
          + '<div style="font-size:36px;font-weight:bold;color:' + confidenceColor + '">' + Math.floor(confidence) + '<span style="font-size:16px;color:#6b7280">/100</span></div>'
          + '<div style="background:#0f172a;border-radius:4px;height:8px;margin-top:8px;overflow:hidden"><div style="height:100%;background:' + confidenceColor + ';width:' + confidence + '%;transition:width 0.5s"></div></div>'
          + '<p style="color:#6b7280;font-size:11px;margin-top:6px">' + confidenceLabel + '</p>'
          + '</div>'
          + '</div>'

          // Cert grid
          + '<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:16px">'
          + certCard('ul1973', 'UL1973', 'USA 🇺🇸', certs.ul1973)
          + certCard('iec62619', 'IEC 62619', 'Europe 🇪🇺', certs.iec62619)
          + certCard('ce_mark', 'CE Marking', 'Europe 🇪🇺', certs.ce_mark)
          + certCard('csa_c22', 'CSA C22.2', 'Canada 🇨🇦', certs.csa_c22)
          + certCard('un383', 'UN38.3', 'International ✈️', certs.un383)
          + certCard('iso9001', 'ISO 9001', 'Quality 🏅', certs.iso9001)
          + '</div>'

          // Stats bar
          + '<div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px">'
          + '<div style="background:#1e293b;border-radius:8px;padding:16px;text-align:center">'
          + '<div style="font-size:24px;font-weight:bold;color:#a855f7">' + certCount + '/6</div>'
          + '<div style="color:#6b7280;font-size:11px">Certifications</div></div>'
          + '<div style="background:#1e293b;border-radius:8px;padding:16px;text-align:center">'
          + '<div style="font-size:24px;font-weight:bold;color:#22d3ee">⚡ ' + Math.floor(gameState.resources.gridAccessTokens || 0) + '</div>'
          + '<div style="color:#6b7280;font-size:11px">Grid Tokens</div></div>'
          + '<div style="background:#1e293b;border-radius:8px;padding:16px;text-align:center">'
          + '<div style="font-size:24px;font-weight:bold;color:#eab308">🏛️ ' + Math.floor(gameState.resources.lobbyingPoints || 0) + '</div>'
          + '<div style="color:#6b7280;font-size:11px">Lobbying</div></div>'
          + '<div style="background:#1e293b;border-radius:8px;padding:16px;text-align:center">'
          + '<div style="font-size:24px;font-weight:bold;color:#22c55e">' + Phase2ScaleUpPlugin._complianceOfficers + '</div>'
          + '<div style="color:#6b7280;font-size:11px">Compliance Officers</div></div>'
          + '</div>'

          + '</div>';
      },
    });

    // === HOOKS ===

    // Investor confidence affects production
    gameEngine.on('calculateProduction', function(state) {
      var confidence = state.resources.investorConfidence || 50;
      if (confidence < 30) {
        state.multipliers.productionSpeed *= 0.5;
      } else if (confidence >= 60 && confidence < 85) {
        state.multipliers.productionSpeed *= 1.25;
      } else if (confidence >= 85) {
        state.multipliers.productionSpeed *= 1.5;
      }
    });

    // Battery sales increase investor confidence
    gameEngine.on('tick', function(state, deltaTime) {
      if (state.batteriesPerSecond > 0 && state.resources.investorConfidence !== undefined) {
        state.resources.investorConfidence = Math.min(100,
          state.resources.investorConfidence + state.batteriesPerSecond * 0.001
        );
      }
    });

    console.log('[Phase2] Initialized successfully.');
  }

  static onTick(gameState, deltaTime) {
    // Only run if phase 2 is active (batteries >= 1000)
    if (gameState.batteries < 1000) return;

    var pd = gameState.pluginData;

    // === Unlock announcement ===
    if (!this._unlockEventFired) {
      this._unlockEventFired = true;
      gameState.events = [{
        text: "🏢 Phase 2 Unlocked: The Scale-Up Nightmare! You've outgrown your garage. Now comes the REAL pain. Check the Certifications tab!",
        time: Date.now()
      }, ...gameState.events.slice(0, 9)];
    }

    // === COMPLIANCE DECAY (-0.05% per second) ===
    if (gameState.resources.regulatoryCompliance > 0) {
      gameState.resources.regulatoryCompliance *= 0.9995;
      if (gameState.resources.regulatoryCompliance < 0.1) {
        gameState.resources.regulatoryCompliance = 0;
      }
    }

    // === COMPLIANCE OFFICERS generate compliance ===
    if (this._complianceOfficers > 0) {
      gameState.resources.regulatoryCompliance =
        (gameState.resources.regulatoryCompliance || 0) + (this._complianceOfficers * 0.5);
    }

    // === LOBBYISTS generate lobbying points ===
    if (this._lobbyists > 0) {
      gameState.resources.lobbyingPoints =
        (gameState.resources.lobbyingPoints || 0) + this._lobbyists;

      // 0.5% chance per tick a lobbyist gets caught doing crimes
      if (Math.random() < 0.005 * this._lobbyists) {
        gameState.resources.investorConfidence = Math.max(0,
          (gameState.resources.investorConfidence || 50) - 5
        );
        gameState.events = [{
          text: "🏛️ One of your lobbyists got caught in a scandal! -5 investor confidence. Whoops.",
          time: Date.now()
        }, ...gameState.events.slice(0, 9)];
      }
    }

    // === INVESTOR CONFIDENCE: tech debt penalty ===
    if (gameState.techDebt > 100) {
      var debtPenalty = Math.floor(gameState.techDebt / 200) * 0.1;
      gameState.resources.investorConfidence = Math.max(0,
        (gameState.resources.investorConfidence || 50) - debtPenalty
      );
    }

    // === Clamp investor confidence ===
    gameState.resources.investorConfidence = Math.max(0, Math.min(100,
      gameState.resources.investorConfidence || 50
    ));

    // === INSURANCE PREMIUMS (ongoing costs) ===
    var insuranceCost = 0;
    if (pd.insurance_basic) insuranceCost += 500;
    if (pd.insurance_fire) insuranceCost += 1500;
    if (pd.insurance_cyber) insuranceCost += 2500;
    if (pd.insurance_dno) insuranceCost += 5000;
    insuranceCost *= this._insurancePremiumMultiplier;
    if (insuranceCost > 0) {
      gameState.money -= insuranceCost;
    }

    // === SAFETY CONSULTANT countdown ===
    if (pd.safetyConsultantTicks && pd.safetyConsultantTicks > 0) {
      pd.safetyConsultantTicks--;
    }

    // === MCKINSEY EVENT CHAIN ===
    if (this._mckinseyTimer > 0) {
      this._mckinseyTimer++;

      if (this._mckinseyStage === 0 && this._mckinseyTimer >= 10) {
        gameState.events = [{
          text: "💼 McKinsey wants to schedule a kickoff meeting. You're paying $500/hour for this.",
          time: Date.now()
        }, ...gameState.events.slice(0, 9)];
        this._mckinseyStage = 1;
      }
      if (this._mckinseyStage === 1 && this._mckinseyTimer >= 30) {
        gameState.events = [{
          text: "💼 McKinsey Week 1: 'Information gathering phase.' Nothing is happening. Your bank account disagrees.",
          time: Date.now()
        }, ...gameState.events.slice(0, 9)];
        this._mckinseyStage = 2;
      }
      if (this._mckinseyStage === 2 && this._mckinseyTimer >= 120) {
        gameState.events = [{
          text: "💼 McKinsey Week 4: 'Analysis phase.' They've made 47 slides so far. Content: TBD.",
          time: Date.now()
        }, ...gameState.events.slice(0, 9)];
        this._mckinseyStage = 3;
      }
      if (this._mckinseyStage === 3 && this._mckinseyTimer >= 300) {
        gameState.events = [{
          text: "📊 McKinsey Final Deliverable: 200 slides. Key insight: 'Make more batteries, spend less money.' Board is THRILLED. +5 investor confidence.",
          time: Date.now()
        }, ...gameState.events.slice(0, 9)];
        gameState.resources.investorConfidence = Math.min(100,
          (gameState.resources.investorConfidence || 50) + 5
        );
        this._mckinseyTimer = 0;
        this._mckinseyStage = 0;

        // Achievement: McKinsey'd
        if (!gameState.achievements.find(function(a) { return a.id === 'mckinseyd'; })) {
          gameState.achievements = [
            ...gameState.achievements,
            { id: 'mckinseyd', name: "McKinsey'd", description: "Money well spent. (Narrator: It wasn't)" }
          ];
          gameState.events = [{
            text: "🏆 Achievement: McKinsey'd",
            time: Date.now()
          }, ...gameState.events.slice(0, 9)];
        }
      }
    }

    // === PR BACKFIRE EVENT ===
    if (pd.prBackfire) {
      pd.prBackfire = false;
      gameState.events = [{
        text: "📰 PR Backfire! Your press release was misquoted. 'BESS Tycoon CEO admits batteries are dangerous!' -10 investor confidence.",
        time: Date.now()
      }, ...gameState.events.slice(0, 9)];
    }

    // === RANDOM EVENTS (Phase 2 specific) ===
    var safetyActive = pd.safetyConsultantTicks > 0;
    var eventChance = safetyActive ? 0.005 : 0.01;

    if (Math.random() < eventChance) {
      this._triggerPhase2Event(gameState);
    }

    // === ACHIEVEMENT CHECKS ===
    this._checkAchievements(gameState);
  }

  static _triggerPhase2Event(gameState) {
    var certs = gameState.certifications || {};
    var pool = [];

    // Surprise UL1973 Audit
    if (certs.ul1973) {
      pool.push(function(gs) {
        // Random outcome: mostly just compliance drain
        if (Math.random() < 0.4) {
          // Pass the audit
          gs.resources.regulatoryCompliance = (gs.resources.regulatoryCompliance || 0) + 30;
          gs.resources.investorConfidence = Math.min(100, (gs.resources.investorConfidence || 50) + 5);
          Phase2ScaleUpPlugin._auditsSurvived++;
          gs.events = [{ text: "📋 Surprise UL1973 Audit! You passed. +30 compliance, +5 investor confidence. Crisis averted!", time: Date.now() }, ...gs.events.slice(0, 9)];
        } else {
          gs.resources.regulatoryCompliance = Math.max(0, (gs.resources.regulatoryCompliance || 0) - 30);
          gs.events = [{ text: "📋 Surprise UL1973 Audit! Auditors found 'minor discrepancies.' -30 compliance. Maybe re-test everything...", time: Date.now() }, ...gs.events.slice(0, 9)];
        }
      });
    }

    // Competitor Launch
    if (gameState.batteries >= 5000 && !this._competitorEventFired) {
      pool.push(function(gs) {
        Phase2ScaleUpPlugin._competitorEventFired = true;
        gs.resources.investorConfidence = Math.max(0, (gs.resources.investorConfidence || 50) - 15);
        gs.events = [{ text: "🚨 Competitor Launch! Tesla announces Megapack 3. It's better than yours. -15 investor confidence.", time: Date.now() }, ...gs.events.slice(0, 9)];
      });
    }

    // New Regulation Dropped
    if (gameState.batteries >= 3000) {
      pool.push(function(gs) {
        gs.resources.regulatoryCompliance = (gs.resources.regulatoryCompliance || 0) * 0.75;
        gs.money -= 50000;
        gs.events = [{ text: "📜 New Regulation Dropped! EPA updated battery disposal requirements. Compliance reduced 25%, -$50k to update processes.", time: Date.now() }, ...gs.events.slice(0, 9)];
      });
    }

    // Trade War Tariffs
    if (gameState.batteries >= 10000) {
      pool.push(function(gs) {
        gs.money -= 25000;
        gs.events = [{ text: "🌐 Trade War! New 25% tariff on imported battery components. Production costs spike. -$25k.", time: Date.now() }, ...gs.events.slice(0, 9)];
      });
    }

    // Investor board meeting
    pool.push(function(gs) {
      var confidence = gs.resources.investorConfidence || 50;
      if (confidence < 40) {
        gs.resources.investorConfidence = Math.max(0, confidence - 5);
        gs.events = [{ text: "💼 Board Meeting: 'Where's the growth?' Investors are getting restless. -5 confidence.", time: Date.now() }, ...gs.events.slice(0, 9)];
      } else {
        gs.resources.investorConfidence = Math.min(100, confidence + 3);
        gs.events = [{ text: "💼 Board Meeting: 'Impressive Q2 numbers.' Board is cautiously optimistic. +3 confidence.", time: Date.now() }, ...gs.events.slice(0, 9)];
      }
    });

    // Insurance incident
    if (gameState.pluginData.insurance_basic) {
      pool.push(function(gs) {
        Phase2ScaleUpPlugin._totalClaims++;
        if (Phase2ScaleUpPlugin._totalClaims >= 3) {
          Phase2ScaleUpPlugin._insurancePremiumMultiplier = 2;
        }
        if (Math.random() < 0.6) {
          gs.money += 15000;
          gs.events = [{ text: "📄 Insurance Claim Approved! +$15k reimbursement. The system works! (Sometimes.)", time: Date.now() }, ...gs.events.slice(0, 9)];
        } else {
          gs.events = [{ text: "📄 Insurance Claim DENIED! 'Not covered under Section 4.7.B.12.' This is why you read the fine print. (You didn't.)", time: Date.now() }, ...gs.events.slice(0, 9)];
        }
      });
    }

    // Generic compliance flavor events
    pool.push(function(gs) {
      var msgs = [
        "📋 Annual compliance review scheduled. Better get those docs in order.",
        "🤝 You shook 147 hands at a networking event today. Only 3 might matter.",
        "💼 Board wants to know: When moon?",
        "📧 Regulator sent a 'friendly reminder' about upcoming deadlines. Not friendly.",
        "☕ Compliance officer #" + Phase2ScaleUpPlugin._complianceOfficers + " quit. 'I can't take the paperwork anymore.'",
        "📊 Industry benchmarking report published. You're... average. Investors hate average.",
      ];
      var msg = msgs[Math.floor(Math.random() * msgs.length)];
      gs.events = [{ text: msg, time: Date.now() }, ...gs.events.slice(0, 9)];
    });

    // Pick and execute a random event
    if (pool.length > 0) {
      var event = pool[Math.floor(Math.random() * pool.length)];
      event(gameState);
    }
  }

  static _checkAchievements(gameState) {
    var certs = gameState.certifications || {};
    var certCount = Object.values(certs).filter(Boolean).length;

    // Certified Bureaucrat: 3 certifications
    if (certCount >= 3 && !gameState.achievements.find(function(a) { return a.id === 'certified-bureaucrat'; })) {
      gameState.resources.investorConfidence = Math.min(100, (gameState.resources.investorConfidence || 50) + 10);
      gameState.achievements = [...gameState.achievements, { id: 'certified-bureaucrat', name: 'Certified Bureaucrat', description: "You've mastered the art of form-filling" }];
      gameState.events = [{ text: "🏆 Achievement: Certified Bureaucrat! +10 investor confidence.", time: Date.now() }, ...gameState.events.slice(0, 9)];
    }

    // Audit Survivor: 5 audits
    if (this._auditsSurvived >= 5 && !gameState.achievements.find(function(a) { return a.id === 'audit-survivor'; })) {
      gameState.resources.investorConfidence = Math.min(100, (gameState.resources.investorConfidence || 50) + 50);
      gameState.achievements = [...gameState.achievements, { id: 'audit-survivor', name: 'Audit Survivor', description: "You've seen things..." }];
      gameState.events = [{ text: "🏆 Achievement: Audit Survivor! +50 investor confidence.", time: Date.now() }, ...gameState.events.slice(0, 9)];
    }

    // Lobbying Legend: spent 500+ lobbying points
    if (this._lobbyingSpent >= 500 && !gameState.achievements.find(function(a) { return a.id === 'lobbying-legend'; })) {
      gameState.resources.regulatoryCompliance = (gameState.resources.regulatoryCompliance || 0) + 100;
      gameState.achievements = [...gameState.achievements, { id: 'lobbying-legend', name: 'Lobbying Legend', description: "Democracy(tm) in action" }];
      gameState.events = [{ text: "🏆 Achievement: Lobbying Legend! +100 compliance.", time: Date.now() }, ...gameState.events.slice(0, 9)];
    }

    // Compliance Decay: compliance hits 0
    if ((gameState.resources.regulatoryCompliance || 0) <= 0 && certCount > 0 && !gameState.achievements.find(function(a) { return a.id === 'compliance-decay'; })) {
      gameState.achievements = [...gameState.achievements, { id: 'compliance-decay', name: 'Compliance Decay', description: "How did you let it get this bad?" }];
      gameState.events = [{ text: "🏆 Achievement: Compliance Decay! How did you let it get this bad?", time: Date.now() }, ...gameState.events.slice(0, 9)];
    }

    // Unicorn Status: investor confidence 90+
    if ((gameState.resources.investorConfidence || 0) >= 90 && !gameState.achievements.find(function(a) { return a.id === 'unicorn-status'; })) {
      gameState.money += 100000;
      gameState.achievements = [...gameState.achievements, { id: 'unicorn-status', name: 'Unicorn Status', description: "Congratulations on your imaginary horse" }];
      gameState.events = [{ text: "🏆 Achievement: Unicorn Status! +$100k bonus. Congratulations on your imaginary horse.", time: Date.now() }, ...gameState.events.slice(0, 9)];
    }
  }

  static onBeforeSave(saveData) {
    saveData.pluginData = saveData.pluginData || {};
    saveData.pluginData.phase2 = {
      mckinseyTimer: this._mckinseyTimer,
      mckinseyStage: this._mckinseyStage,
      auditsSurvived: this._auditsSurvived,
      lobbyingSpent: this._lobbyingSpent,
      totalClaims: this._totalClaims,
      competitorEventFired: this._competitorEventFired,
      unlockEventFired: this._unlockEventFired,
      complianceOfficers: this._complianceOfficers,
      lobbyists: this._lobbyists,
      insurancePremiumMultiplier: this._insurancePremiumMultiplier,
    };
  }

  static onAfterLoad(saveData, gameState) {
    var d = saveData.pluginData && saveData.pluginData.phase2;
    if (d) {
      this._mckinseyTimer = d.mckinseyTimer || 0;
      this._mckinseyStage = d.mckinseyStage || 0;
      this._auditsSurvived = d.auditsSurvived || 0;
      this._lobbyingSpent = d.lobbyingSpent || 0;
      this._totalClaims = d.totalClaims || 0;
      this._competitorEventFired = d.competitorEventFired || false;
      this._unlockEventFired = d.unlockEventFired || false;
      this._complianceOfficers = d.complianceOfficers || 0;
      this._lobbyists = d.lobbyists || 0;
      this._insurancePremiumMultiplier = d.insurancePremiumMultiplier || 1;
    }
  }

  static cleanup() {
    console.log('[Phase2] Cleaning up...');
    this._mckinseyTimer = 0;
    this._mckinseyStage = 0;
  }
}

if (typeof PluginRegistry !== 'undefined') {
  PluginRegistry.register(Phase2ScaleUpPlugin);
}
