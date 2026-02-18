# Phase 2: The Scale-Up Nightmare
## "You've outgrown your garage. Now comes the *real* pain."

**Unlock Condition:** 1,000 batteries produced  
**Theme:** Bureaucracy, regulations, and the consulting-industrial complex  
**Tone:** Kafkaesque corporate hellscape with dark humor

---

## 🎯 Core Concept

You're no longer a scrappy startup - you're now a *real company*. With that comes:
- Regulatory compliance (it decays!)
- Investor relations (they're never happy)
- Certification gauntlet (endless paperwork)
- Insurance nightmares (everything is a liability)
- Consulting grifters (they smell money)

The core tension: **Growth requires compliance, but compliance slows growth.**

---

## 💰 New Resources/Currencies

### 1. **Regulatory Compliance Points** 
- **Symbol:** 📋
- **Starting value:** 0
- **How to gain:**
  - Complete certifications (+50 to +200)
  - Pass audits (+30)
  - Hire compliance officers (+0.5/sec per officer)
  - Bribe regulators (+20, but risky!)
- **How to lose:**
  - Natural decay (-0.05% per second) - *regulations never stop changing*
  - Failed audits (-50)
  - Incidents/accidents (-30)
  - Competitor complaints (-20)
- **Used for:**
  - Unlocking market expansions
  - Required minimum to sell in certain regions
  - Prerequisite for certifications
- **Flavor text:** "Measure of how many hoops you've jumped through. The hoops keep moving."

### 2. **Investor Confidence**
- **Symbol:** 💼
- **Starting value:** 50 (out of 100)
- **Display:** Progress bar with color coding:
  - 0-30: 🔴 Red (Vulture VCs circling)
  - 31-60: 🟡 Yellow (Nervous board meetings)
  - 61-85: 🟢 Green (Confident)
  - 86-100: 💎 Blue (Unicorn status!)
- **How to gain:**
  - Battery sales (+0.01 per battery)
  - Revenue milestones (+5 to +20)
  - Hire McKinsey (+20 instant)
  - PR stunts (+10)
  - Pass audits (+5)
- **How to lose:**
  - Incidents (-10 to -40)
  - Failed certifications (-20)
  - Missed revenue targets (-15)
  - Tech debt too high (-5 per 1000 debt)
  - Competitor success (-3)
- **Effects:**
  - < 30: Production speed -50%, can't raise funding
  - 30-60: Normal operations
  - 60-85: Production speed +25%, easier certifications
  - 85+: Production speed +50%, VIP fast-track for everything
- **Flavor text:** "They believed in you once. Can you keep the dream alive?"

### 3. **Grid Access Tokens**
- **Symbol:** ⚡
- **Starting value:** 1
- **How to gain:**
  - Complete utility partnerships (one-time rewards)
  - Government grants (+1 per grant)
  - Trade show networking (random chance)
  - Lobbying (+1 per 50 lobbying points)
- **How to lose:**
  - Spend to connect to new grids (consumed on use)
  - Grid operator relationships sour (-1)
- **Used for:**
  - Connect to increasingly profitable power grids
  - Each grid has different characteristics (see Markets section)
- **Flavor text:** "Limited licenses to print money. Well, to store and sell electrons."

### 4. **Lobbying Points**
- **Symbol:** 🏛️
- **Starting value:** 0
- **How to gain:**
  - Hire lobbyists (+1/sec per lobbyist)
  - Donate to politicians (+10 per $100k)
  - Industry association membership (+5/month)
  - Trade show schmoozing (+1-5 random)
- **How to lose:**
  - Spend on favorable regulations (costs vary)
  - Spend on grid access (50 points per token)
- **Used for:**
  - Unlock favorable regulations
  - Speed up certification processes
  - Block competitor advantages
  - Secure subsidies
- **Flavor text:** "Democracy has a price. A very specific, calculable price."

---

## 🏢 New Upgrade Categories

### **The Certification Gauntlet**
*Theme: Bureaucratic hell. Each cert takes time + money + compliance points.*

| Certification | Cost | Compliance Required | Effect | Flavor |
|--------------|------|---------------------|--------|--------|
| **UL1973** (USA) | $50k, 100 📋 | - | Unlock US market, +50% US price | "The gold standard. The paperwork weighs 40 lbs." |
| **IEC 62619** (Europe) | $80k, 150 📋 | UL1973 | Unlock EU market, +60% EU price | "28 countries, 28 different interpretations." |
| **CE Marking** (Europe) | $30k, 80 📋 | IEC 62619 | Required for EU shipping | "It's not a checkmark. It's a 'Conformité Européenne' marking. Get it right." |
| **CSA C22.2** (Canada) | $40k, 100 📋 | UL1973 | Unlock Canadian market | "Like UL1973 but with bilingual forms." |
| **UN38.3** (Shipping) | $100k, 200 📋 | All basic certs | Can ship batteries internationally | "Your batteries won't explode on a plane. Probably." |
| **ISO 9001** (Quality) | $150k, 250 📋 | - | +25% investor confidence, enables enterprise sales | "You have processes for your processes now." |

**Certification Mini-Game Idea:**
Each certification has a "progress bar" that fills as you complete tasks:
- Submit initial application (instant)
- Wait for review (2-5 minutes real-time)
- Respond to questions (click-based)
- Schedule on-site inspection (costs extra)
- Fix non-conformances (random chance of issues)
- Final approval (waiting game)

**Random Audit Events** (once certified):
- Surprise audits (must maintain compliance or lose cert)
- Regulation updates (must re-certify every 2 years)
- Certificate expires (countdown timer shown)

---

### **The Consulting Industrial Complex**
*Theme: They smell your VC money. They're here to "help."*

| Consultant Type | Cost | Duration | Effect | Risk |
|-----------------|------|----------|--------|------|
| **McKinsey** | $500k | One-time | +20 💼, unlock "strategic planning" tab | Random event: Useless 200-slide deck delivered |
| **Deloitte** | $300k | One-time | -500 tech debt, +10 💼 | They find MORE issues than they fix |
| **Big4 Auditor** | $100k/year | Continuous | +50 📋/month, required for enterprise sales | Annual surprise findings |
| **Safety Consultant** | $75k | One-time | -50% incident probability for 6 months | Can't prevent everything |
| **PR Firm** | $200k | One-time | +15 💼, unlock "PR Stunts" | 10% chance of backfire |
| **Lobbyist** (retainer) | $50k/month | Continuous | +10 🏛️/day | Occasionally gets caught doing crimes |

**Consultant Event Chain Example:**
1. Hire McKinsey → +20 investor confidence immediately
2. 10 seconds later: "McKinsey wants to schedule kickoff meeting"
3. 30 seconds later: "Week 1: Information gathering" (nothing happens)
4. 2 minutes later: "Week 4: Analysis phase" (still nothing)
5. 5 minutes later: "Final deliverable ready!"
6. Reveals: 200-slide deck that says "make more batteries, spend less money"
7. Board is thrilled. +5 investor confidence
8. Player realizes they just paid $500k for obvious advice

---

### **Insurance Tier System**
*Theme: Everything is a liability. Everything.*

| Insurance Type | Cost/month | Coverage | Unlocks | Flavor |
|----------------|------------|----------|---------|--------|
| **Basic Liability** | $5k | Covers minor accidents | Required for any sales | "The bare minimum" |
| **Fire Insurance** | $15k | Covers thermal runaway | Required for >100 batteries | "Battery fires are... different" |
| **Cyber Insurance** | $25k | Covers ransomware/hacks | Required for grid connection | "Someone *will* hack your BMS" |
| **D&O Insurance** | $50k | Protects executives | Required for Series B funding | "So you can sleep at night" |
| **Errors & Omissions** | $40k | Professional liability | Required for consulting services | "For when your batteries don't work" |
| **Environmental** | $100k | Covers hazmat cleanup | Required for manufacturing | "Lithium is... spicy" |

**Insurance Events:**
- **Claim approved:** Get some money back after incident
- **Claim denied:** Fine print says you're not covered for *that* specific thing
- **Premium hike:** After 3 claims, rates double
- **Insurance investigator:** They want to inspect your facilities (costs time + money)

---

### **Trade Show Circuit**
*Theme: Professional networking is 70% small talk, 30% business cards.*

| Trade Show | Cost | Location | Potential Gains | Flavor |
|------------|------|----------|----------------|--------|
| **RE+ (Renewable Energy)** | $30k | Vegas | +1 ⚡, potential partnerships, +5 💼 | "The biggest show in clean energy. Also: endless buffets." |
| **Energy Storage Summit** | $20k | Austin | +2 ⚡, technical learning | "Where battery nerds gather" |
| **DistribuTECH** | $25k | San Diego | Utility contacts, +1 ⚡ | "Meet the people who control the grid" |
| **CES** | $50k | Vegas | Media hype, +20 💼 | "Batteries at a consumer electronics show? Sure, why not." |
| **Local Chamber Breakfast** | $500 | Your city | +5 🏛️, weak local connections | "The schmooze is real" |

**Trade Show Mini-Events:**
- Your booth catches fire (ironically) → -20 💼
- CEO of major utility stops by → Potential partnership unlocked
- Competitor launches better product → -10 💼
- You win "Best Battery Innovation" award → +15 💼, 🏆 achievement
- Nobody visits your booth → Wasted money, awkward silence

---

## 🎲 Random Events (The Nightmare Begins)

### **Regulatory Events**

#### "Surprise UL1973 Audit!"
- **Trigger:** Own UL1973 cert, 5% chance per hour
- **Description:** "Auditors found 'minor discrepancies' in your test data."
- **Choices:**
  1. **Re-test everything properly** ($30k) → +50 📋, +5 💼, crisis averted
  2. **Bribe them with gift cards** ($5k) → 30% success (+20 📋), 70% DISASTER (lose cert, -40 💼)
  3. **Ignore it** (free) → -30 📋, findings go public

#### "New Regulation Dropped"
- **Trigger:** Random, higher chance after 10k batteries
- **Description:** "The EPA just released updated battery disposal requirements."
- **Effect:** 
  - All compliance points reduced by 25%
  - Must spend $50k to update processes
  - 2 week deadline (real-time countdown!)
- **Flavor:** "Change is the only constant. Except in regulations. Those change too."

#### "Trade War Tariffs"
- **Trigger:** 10k+ batteries, 3% chance per day
- **Description:** "New 25% tariff on imported battery components."
- **Choices:**
  1. **Pay the tariff** → Production cost +25% for 30 days
  2. **Find domestic suppliers** ($100k) → Costs more upfront, but long-term cheaper
  3. **Lobby against it** (50 🏛️) → 40% chance to reverse
- **Flavor:** "Geopolitics: It's not just for history class anymore!"

---

### **Investor/Business Events**

#### "Series B Pressure"
- **Trigger:** Investor confidence 40-60, 1M+ revenue
- **Description:** "Lead investor wants 3x growth by next quarter or they're out."
- **Effect:** New objective appears: "Hit $3M revenue in 90 days or lose funding"
- **Failure state:** If missed, investor confidence drops to 20, must find new funding

#### "McKinsey Report Delivered"
- **Trigger:** 10 minutes after hiring McKinsey
- **Description:** *200-slide PDF appears (actually generated)*
- **Key recommendations:**
  1. "Increase production" (obvious)
  2. "Reduce costs" (thanks)
  3. "Hire more people" (wait what)
  4. "Enter new markets" (we're trying!)
- **Effect:** Board loves it (+5 💼), you paid $500k for this
- **Achievement unlocked:** "Consultancy Brain Rot"

#### "Competitor Launch"
- **Trigger:** 5k batteries produced
- **Description:** "Tesla announces new Megapack 3. It's better than yours."
- **Effect:** 
  - Market prices drop 20% for 7 days
  - Your investor confidence -15
  - New upgrade unlocked: "Counter-marketing campaign" ($100k)

---

### **Operational Events**

#### "Insurance Claim Saga"
- **Trigger:** After any incident
- **Multi-stage event:**
  1. **File claim** → Wait 3 minutes
  2. **Adjuster visit** → Answer questions (click-based)
  3. **Initial denial** → "Not covered under Section 4.7.B.12"
  4. **Appeal** → Cost: $10k lawyer fee
  5. **Settlement offer** → 60% of damages
- **Flavor:** "This is why you read the fine print. (You didn't.)"

#### "The Grid Defection"
- **Trigger:** Connected to 3+ grids, random
- **Description:** "California ISO is kicking battery storage providers off their market."
- **Effect:** Lose 1 ⚡ token, revenue from that grid stops
- **Choice:** 
  - **Sue them** ($200k, 20% win chance, takes 6 months)
  - **Lobby for reinstatement** (100 🏛️, 60% success)
  - **Accept it** → Move on

---

## 🏪 New Markets System

### Market Tiers (Unlocked with Grid Access Tokens)

| Market | Token Cost | Revenue Multiplier | Risk Level | Requirements |
|--------|------------|-------------------|------------|---------------|
| **Local Municipal** | 0 (starter) | 1.0x | Low | None |
| **State Wholesale** | 1 ⚡ | 1.5x | Medium | UL1973 cert |
| **CAISO (California)** | 2 ⚡ | 2.0x | High | Multiple certs, high compliance |
| **PJM (East Coast)** | 2 ⚡ | 1.8x | Medium | ISO 9001, good track record |
| **ERCOT (Texas)** | 1 ⚡ | 3.0x | EXTREME | No regulations! But... it's Texas's grid |
| **European TSO** | 3 ⚡ | 2.5x | Medium | All EU certs, expensive |
| **Private Enterprise** | 1 ⚡ | 2.2x | Low | ISO 9001, D&O insurance |

**Market Characteristics:**
- Each market has different **time-of-use pricing curves**
- Some markets have **seasonal variations** (e.g., Texas summer spike)
- **Capacity payments** vs. **energy arbitrage** opportunities
- Random **curtailment events** (grid tells you to stop)

---

## 🎨 New UI Elements

### **Compliance Dashboard**
- **Visual:** Decay meter showing regulatory compliance dropping in real-time
- **Color-coded warnings:**
  - Green (80-100): You're good
  - Yellow (50-79): Attention needed
  - Orange (30-49): Audits incoming
  - Red (0-29): You're in violation
- **Recent activity log:**
  - "UL1973 annual renewal due in 45 days"
  - "IEC certificate expires in 180 days"
  - "New regulation published today"

### **Investor Relations Tab**
- **Confidence meter** with historical chart
- **Recent board feedback:**
  - "Impressed with Q2 growth"
  - "Concerned about recent incident"
  - "Requesting McKinsey analysis"
- **Next milestone:** Shows what's needed to raise more funding
- **Burn rate calculator:** "You have 18 months of runway"

### **Certifications Board**
- **Grid layout of certification cards:**
  - Shows status (Not started / In progress / Certified / Expired)
  - Progress bar for certs in progress
  - Countdown timer for expiring certs
  - Cost and requirements displayed
- **Certification dependency tree** (visual flowchart)

### **Market Map**
- **Geographic map** showing available markets
- **Hover for details:**
  - Current price
  - Your market share
  - Competition level
  - Recent events
- **Connection status:** Which grids you're active on

---

## 📊 New Metrics & Stats

### **Compliance Score Over Time**
- Line graph showing decay and recovery
- Markers for major events (audits, violations, renewals)

### **Market Revenue Breakdown**
- Pie chart of revenue by market
- Identifies most profitable grids
- Shows exposure/risk concentration

### **Incident Rate Tracker**
- Moving average of incidents per 1000 batteries
- Industry benchmark comparison
- Insurance premium impact forecast

---

## 🏆 New Achievements

| Achievement | Condition | Reward | Flavor |
|-------------|-----------|--------|--------|
| **Certified Bureaucrat** | Earn 3 certifications | +10 💼 | "You've mastered the art of form-filling" |
| **Regulatory Speedrun** | Earn UL1973 in under 5 minutes | +50 📋 | "You knew someone, didn't you?" |
| **McKinsey'd** | Hire McKinsey | 🏆 | "Money well spent. (Narrator: It wasn't)" |
| **Insurance Fraud** (???) | File 10 claims | -20 💼 | "The adjusters know you by name now" |
| **Grid Master** | Connect to all 7 markets | +3 ⚡ | "You're everywhere" |
| **Lobbying Legend** | Spend 500 🏛️ | +100 📋 | "Democracy™ in action" |
| **Audit Survivor** | Pass 5 surprise audits | +50 💼 | "You've seen things..." |
| **Compliance Decay** | Let compliance hit 0 | Achievement | "How did you let it get this bad?" |
| **Unicorn Status** | Investor confidence 90+ | +100k $ | "Congratulations on your imaginary horse" |

---

## 💭 Narrative Flavor Text

### **Upon Phase 2 Unlock:**
> "Congratulations! You've outgrown your garage.
> 
> Unfortunately, this means you're now subject to:
> - 47 different regulatory bodies
> - 3 types of insurance (none of which cover the thing that will actually go wrong)
> - Quarterly board meetings (where you explain why you're not growing fast enough)
> - Consultants (who will charge you $500/hour to tell you what you already know)
> 
> Welcome to the big leagues. We hope you like paperwork."

### **Random Loading Messages:**
- "Waiting for regulatory approval..."
- "Generating compliance report..."
- "Scheduling audit..."
- "Calculating insurance premium hike..."
- "Reading McKinsey deck (slide 47 of 200)..."
- "Lobbying congressman..."
- "Designing trade show booth..."

### **Event Flavor:**
- **Certification Approved:** "🎉 Your paperwork was deemed sufficient! Only took 6 months."
- **Compliance Drops Below 50:** "⚠️ Your regulatory compliance is slipping. Auditors are circling."
- **Investor Meeting:** "💼 Board wants to know: When moon?"
- **Trade Show Success:** "🤝 You shook 147 hands today. Only 3 might matter."

---

## 🎮 Gameplay Loop Summary

1. **Produce batteries** → Generates revenue + investor confidence
2. **Build compliance** → Required to unlock certifications & markets
3. **Get certified** → Opens new markets with higher revenue
4. **Manage investor relations** → Unlock funding for expansion
5. **Navigate random events** → Sometimes disasters, sometimes opportunities
6. **Expand to new markets** → Use grid access tokens wisely
7. **Fight decay** → Compliance drops, certs expire, regulations change
8. **Survive audits** → Random checks to keep you honest

**The core tension:** You're always juggling growth vs. compliance vs. investor expectations vs. operational chaos. It's a plate-spinning simulator.

---

## 🔧 Technical Implementation Notes

- **Decay system:** Compliance should visibly tick down every second (-0.05%/sec)
- **Real-time timers:** Certification progress, audit countdowns, event deadlines
- **Probability-based events:** Some events are RNG, others are triggered by thresholds
- **State dependencies:** Many upgrades/events depend on prior choices
- **Achievement tracking:** Background system monitoring for unlock conditions
- **Save compatibility:** All new resources should have sensible defaults (0 or starter values)

---

## 🎯 Success Metrics (for this phase)

**Phase 2 is "complete" when player:**
- Has earned 100k+ batteries
- Owns 5+ certifications
- Connected to 3+ markets
- Investor confidence stable above 60
- Survived at least 3 major incidents

**Unlock Phase 3:** The Grid Integration Wars

---

*"If you're not drowning in paperwork, you're not scaling properly." - Silicon Valley, probably*
