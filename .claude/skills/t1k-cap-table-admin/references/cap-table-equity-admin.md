---
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-legal
protected: true
---

## Section 4: Cap-Table & Equity Administration

### 4.1 When Is Cap-Table Management Software Needed?

At **five shareholders, no employee options yet**, a spreadsheet suffices initially. However, once PlayableLabs:
- Grants employee stock options (adds 5–10+ option holders)
- Raises institutional capital (Series SAFE or Seed)
- Plans 409A valuations

Then a dedicated cap-table tool becomes valuable.

### 4.2 Options: Carta vs. Pulley vs. AngelList Stack vs. Spreadsheet

#### Carta

| Aspect | Details |
|--------|---------|
| **Cost** | Free "Launch" tier (up to 25 stakeholders, <$1M raised); paid tiers from ~$6/stakeholder/month ($2–5K+/year for larger cap tables) |
| **Features** | Full suite: cap table management, 409A valuation brokering, waterfall analysis, investor relations, SAFEs, Series Seed templates, API access |
| **409A valuation** | ~10 days; Carta handles coordination with independent appraiser (~$2K–$5K) |
| **Best for** | VC-backed startups; full-featured; expensive at early stage |
| **Cons** | Overkill for pre-SAFE; pricing opacity (sales team quotes) |

#### Pulley

| Aspect | Details |
|--------|---------|
| **Cost** | **Startup tier: $1,200/year** (up to 25 stakeholders); Growth tier: $3,500/year (up to 40); ~$4/additional stakeholder; Token plan $4,500/year |
| **Features** | Cap table, option vesting, 409A valuation coordination, waterfall, SAFEs, basic investor updates |
| **409A valuation** | 3–5 days (faster than Carta); coordinates with independent appraiser (~$1.5K–$3K) |
| **Best for** | Early-stage startups with simple cap tables; transparent pricing; fast 409A |
| **Cons** | Fewer integrations than Carta; minimal investor relations features (vs. Carta) |

#### AngelList Stack

| Aspect | Details |
|--------|---------|
| **Cost** | ~$300–500/year |
| **Features** | Basic cap table + SAFE documents + SPV (special purpose vehicle) for syndication; free incorporation bundle available |
| **409A valuation** | Coordinated with third-party provider; ~$2K |
| **Best for** | Angels / individual investors; very cheap; bundled approach (one platform handles incorp + cap table + funding) |
| **Cons** | Limited feature depth; cap table is simpler than Carta/Pulley |

#### DIY Spreadsheet

| Aspect | Details |
|--------|---------|
| **Cost** | $0 (one-time template, e.g., Y Combinator's free cap-table template) |
| **Features** | Manual tracking: shares issued, vesting schedules, waterfall | 409A valuation | NOT coordinated; you hire appraiser separately |
| **Best for** | Pre-SAFE; simple cap tables (<15 stakeholders) |
| **Cons** | Error-prone (formula mistakes); no waterfall automation; painful to scale; no audit trail |

### 4.3 Recommendation for PlayableLabs

**Phase 1 (Now – pre-Series A, months 0–12):**
- **DIY Spreadsheet** (or Pulley Startup tier @ $1,200/yr if you want professional feel + vesting automation)
- **Track:**
  - Founder equity (Tu 47.1%, Thao 12.8% Common)
  - Preferred shares (Bach 32.2%, Tuan 3.95%, Le Huynh Cong Thao 3.95% Preferred A)
  - Reserved option pool (15% for future employees)

**Phase 2 (Series A prep, months 12–18):**
- **Upgrade to Pulley Growth tier** ($3,500/yr) or Carta paid tier
- **Commission 409A valuation** (~$2–3K)
- **Prepare waterfall and SAFEs/terms for upcoming round**

### 4.4 409A Valuation Essentials

[IRC § 409A](https://www.thestartuplawblog.com/blog/409a-valuations-what-every-startup-needs-to-know/) requires an independent appraisal of common stock fair market value (FMV) **before** issuing employee stock options.

#### Key Requirements

1. **Qualified appraiser:** Must have ABV (Accredited in Business Valuation) or ASA (American Society of Appraisers) credential. Self-proclaimed "valuators" do NOT meet IRS safe harbor.
2. **Safe-harbor protection:** Appraiser must follow Treasury Regulation 1.409A-1(b)(5)(iv), which specifies valuation methodologies (Comparable Companies, Precedent Transactions, DCF, Asset-Based).
3. **Cost: $1,500–$9,000** depending on complexity:
   - **Pre-revenue startup with clean cap table:** $1,500–$3,000
   - **Revenue-generating startup, convertibles outstanding:** $3,000–$6,000
   - **Complex cap table or multiple rounds:** $6,000–$9,000+
4. **Timing:** Obtain **before** first option grant. Can be annual (to re-validate FMV as company grows).

#### PlayableLabs Timeline

**Not needed yet** (no employees or option grants). **Needed before issuing first option grant**, likely in Q3/Q4 2026 if hiring.

#### FMV for Early-Stage PlayableLabs (Estimate)

If PlayableLabs has:
- $0–500K in seed funding (SAFE or Preferred share)
- Pre-revenue or early revenue (<$100K ARR)
- Clean cap table (no convertibles yet)

**FMV of common stock likely: $0.01–$0.10 per share**

This allows founder + employee options at low strike prices, minimizing 409A tax issues (ordinary income tax at exercise, if FMV rises sharply).

### 4.5 83(b) Election

#### Overview

An **83(b) election** (IRS Form 83(b)) allows a person who receives **restricted stock with vesting** to pay ordinary income tax on the fair market value **at grant date** (when value is low) rather than at **vesting date** (when value may be high). This defers capital gains until sale.

#### Critical Deadline: 30 Days

The 83(b) election form **must be postmarked and filed with the IRS within 30 days of the grant date**. No extensions. Missing the deadline = no election, tax treated unfavorably.

#### Who Files 83(b)?

- **Founder stock with reverse vesting:** If Tu or Thao received founder Common shares that vest over 4 years, **they may want to file 83(b) if the shares had low FMV at grant date** (e.g., incorporated May 2026, shares issued at $0.0001/share). Filing 83(b) means they pay tax on $0 income now, and if company grows, capital gains tax only upon sale.
- **Employee options with early exercise:** If an employee early-exercises options before vesting (allowed under many option plans), they can file 83(b) to start the vesting clock at grant date rather than exercise date.

#### Process

1. **Obtain IRS Form 83(b)** ([form here](https://www.irs.gov/pub/irs-pdf/f83b.pdf)).
2. **Complete:** Stock recipient's name, grant date, number of shares, FMV at grant, company name, EIN.
3. **File two copies:**
   - Send one to the IRS (address on form, typically a local office).
   - File one with the company (corporate records).
   - Keep one for your records.
4. **Postmark within 30 days of grant date.**

#### PlayableLabs Action

If founders (Tu + Thao) received restricted Common stock during incorporation (May 2026), **check the grant date on the stock purchase agreement**. If not yet 30 days past, file 83(b) immediately. If >30 days, the election window has closed (no cure available).

### 4.6 Founder Stock Purchase Agreement

Founders should sign a **Founder Stock Purchase Agreement** with PlayableLabs:

- **Specifies:** Number of shares, vesting schedule (e.g., 4 years, 1-year cliff), price ($0.0001 per share, nominal).
- **Reverse vesting:** Company can repurchase unvested shares at purchase price if founder departs. Incentivizes staying.
- **Clawback:** If founder leaves during cliff (first year), shares revert to company.
- **Assignment:** Founder agrees shares are "assigned" to company until vesting milestones met.

**Typical language:**
```
"Grantee has been granted the right to purchase [X] shares of common stock
at $0.0001 per share, subject to the following vesting: 25% vests upon the 
first anniversary of the grant date, and the remainder vests monthly over 
the following 36 months. Upon termination of employment, unvested shares 
are forfeited and revert to the Company."
```

Templates available from:
- [Cooley GO (free)](https://www.cooleygo.com/)
- [Carta (paid, included in plan)](https://carta.com/)
- [Y Combinator documents](https://www.ycombinator.com/documents) (SAFEs, not stock agreements, but good reference)

### 4.7 SAFEs: Y Combinator Simple Agreements for Future Equity

When PlayableLabs raises seed funding (anticipated 2026–2027), investors will likely use **SAFEs** (Simple Agreements for Future Equity) rather than priced stock.

#### SAFE Variants

[Y Combinator's post-money SAFE](https://www.ycombinator.com/documents) comes in four flavors:

| SAFE Type | Valuation Cap | Discount | MFN Clause | Best For |
|-----------|---------------|----------|-----------|----------|
| **Cap Only** | Yes (e.g., $5M) | No | Optional | Standard seed (most common) |
| **Discount Only** | No | Yes (e.g., 20%) | Optional | Later rounds (investor less risk) |
| **Cap + Discount** | Yes | Yes | Optional | Investor-friendly (rare in early stage) |
| **MFN Only (no cap/discount)** | No | No | Yes | Friendly founder (rare in early stage) |

**PlayableLabs most likely use:** **Post-money SAFE with Cap Only** (e.g., "$5M post-money cap", "no discount").

#### How It Works

1. **Investor writes check:** $100K SAFE investment.
2. **SAFE agreement:** Specifies $5M valuation cap (maximum valuation at which investor converts).
3. **On next priced round:** Investor automatically converts to Preferred stock at **the lower of:**
   - (a) Valuation cap ($5M), or
   - (b) The Series A valuation actually set by new investors
4. **No equity until next round:** SAFE is NOT stock; it's a promise to convert later. No voting, no dividends, no liquidation rights until conversion.

#### MFN (Most Favored Nation) Clause

If PlayableLabs issues a **second SAFE with better terms** (e.g., $3M cap instead of $5M), the **first SAFE investor gets the better terms too** (automatically amended to $3M cap).

This protects early investors from worse terms being issued to later investors.

### 4.8 Series Seed: Priced Round Alternative

A **Series Seed** (also called Series A if first priced round) is a priced equity round with full negotiation:

- **Preferred shares issued at a set price** (e.g., $0.50/share).
- **Investors get 1x non-participating liquidation preference**, pro-rata rights, board seat.
- **Takes weeks to negotiate** (term sheet, legal fees ~$10–15K).
- **Used for larger rounds** ($500K+) or when VC investor requires full terms.

**PlayableLabs timeline:** Unlikely to do Series Seed until 2027+ (after SAFE rounds).

### 4.9 Option Pool & Employee Grants

When PlayableLabs hires employees, it grants stock options:

- **Strike price:** Set by 409A valuation (e.g., $0.10/share if 409A = $0.10).
- **Vesting:** 4 years, 1-year cliff (employee must stay 1 year to vest any shares; then monthly vesting).
- **Pool size:** Typically 15–20% of fully-diluted cap table (reserved for all future employee + advisor options).
- **Example:** PlayableLabs cap table = 10M shares authorized; 15% employee pool = 1.5M shares reserved.

#### Employee Option Grant Process

1. **Determine grant size:** E.g., engineer hired at $120K salary; grant 50,000 options (strike = 409A FMV, e.g., $0.10 = $5K notional grant value).
2. **Board resolution:** Board authorizes the grant; records in option plan.
3. **Offer letter:** Candidate receives offer letter with option terms (number of shares, strike price, vesting, acceleration on exit, etc.).
4. **Option agreement:** Candidate signs standard CCPA option agreement (state-law template; can be California Corporate Code or Delaware default).
5. **If early exercise:** Candidate exercises before vesting; must file 83(b) within 30 days.

### 4.10 Cap-Table Tools Setup — Action Items

| Phase | Tool | Cost | Timeline |
|-------|------|------|----------|
| **Now (Seed stage)** | Spreadsheet (DIY) OR Pulley Startup | $0 or $1,200/yr | Immediate |
| **Pre-Series A (9–12 months)** | Pulley Growth OR Carta | $3.5K or custom | 12 months |
| **409A Valuation** | Coordinate via Pulley/Carta or DIY appraiser | $2–3K | When first option grant planned (Q4 2026 estimate) |
| **Option Plan documentation** | Y Combinator template or counsel | $0–2K | When hiring first employee |

### 4.11 Costs Summary — Equity & Cap-Table

| Item | Cost | Timing | Notes |
|------|------|--------|-------|
| **Cap-table software (Year 1, Pulley Startup)** | $1,200 | Annual | DIY spreadsheet = $0; Pulley = $1.2K for professional grade |
| **409A Valuation** | $2,000–3,000 | When issuing options | Pre-revenue startup; higher cost if revenue >$500K |
| **Option plan documentation** | $0–2,000 | When hiring | YC template free; attorney review ~$1–2K if desired |
| **83(b) filing** | $0 | Within 30 days of grant | DIY; IRS form + postage |
| **Founder stock agreement** | $0–500 | Upon incorporation | Cooley template free; counsel review ~$500 |
| **SAFE documents** | $0–500 | When raising | Y Combinator template free; counsel review ~$500 |
| **TOTAL Year 1 (cap table + 409A)** | **~$3–5K** | — | Assumes hiring + fundraising in Year 1 |

### Action Items — Cap-Table (30 / 90 / 180 days)

**30 days:**
- Set up cap-table spreadsheet (DIY template or Pulley Startup subscription).
- Record current shareholder positions (Tu, Thao, Bach, Tuan, Le Huynh Cong Thao).
- Check if founder stock grants are >30 days old; if so, file any pending 83(b) elections.

**90 days:**
- If hiring planned, commission 409A valuation (~$2–3K from Carta, Pulley, or direct appraiser contact).
- Prepare employee stock option plan (ESOP) documentation; reserve 15–20% of cap table.

**180 days:**
- Issue first employee options; ensure 83(b) elections filed (if early exercise used).
- Review for Series A readiness (cap table clean, 409A current, SAFE terms drafted).

---

