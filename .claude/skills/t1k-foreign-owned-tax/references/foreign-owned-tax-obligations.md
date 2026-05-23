---
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-legal
protected: true
---

## Section 2: Foreign-Owned Tax Obligations

### 2.1 The US-Vietnam Treaty Gap: The Central Tax Problem

**This is the single most important fact for PlayableLabs founders.** The United States and Vietnam do **NOT** have a comprehensive income tax treaty. [Verify via IRS.gov treaty list](https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z).

**Impact:**
- When PlayableLabs pays dividends to Hoang Anh Tu, Khuc Xuan Thao, or any shareholder resident in Vietnam, the default **US withholding tax rate is 30%** (IRC § 1441(b)(1)).
- **No treaty reduction** to 15%, 10%, or 5% (as exist for UK, Canada, Australia, India treaties).
- **No foreign tax credit** for taxes paid to Vietnam on the same income (Vietnam's domestic withholding rate: 5% on dividends to foreign corporate shareholders). Instead, founders bear both: 30% US + 5% Vietnam = 35% total withholding, with limited cross-credit.

**Mitigation:**
- **Retain earnings in the US entity.** No dividend = no US withholding. Accumulate cash for growth, buyback, or eventual acquisition.
- **Intercompany debt:** Structure founder contributions as debt + equity (instead of all equity) so some returns are interest-deductible at PlayableLabs level and paid as ordinary income (still 30% withheld, but same rate).
- **Sale proceeds:** If PlayableLabs is acquired, founders typically receive stock (tax-deferred) or debt instruments; withholding only applies to cash dividends, not stock sales.

This constraint makes US investor rounds more appealing—US VCs prefer equity over dividends anyway, so they don't pressure early distributions.

### 2.2 Form SS-4: Employer Identification Number (EIN)

Every US corporation needs an EIN from the Internal Revenue Service. PlayableLabs must obtain an EIN before opening a US bank account, hiring employees, or filing tax returns.

#### Application Process for Foreign Applicants

Because all five shareholders are non-US residents, PlayableLabs cannot use the **IRS online system** (restricted to US addresses). Instead, use one of three methods:

**Method 1: Telephone (Fastest)**
- Call **267-941-1099** (IRS International EIN line)
- Hours: 6 a.m.–11 p.m. Eastern Time, Monday–Friday (excluding US federal holidays)
- Processing: Same-day to 5 business days
- Documents required on hand:
  - [Form SS-4](https://www.irs.gov/pub/irs-pdf/fss4.pdf) (completed but NOT signed; you sign during the phone call)
  - Certificate of Incorporation (digital copy)
  - Passport of the applicant (person calling on behalf of the company—usually the CEO or Authorized Representative)

**Method 2: Fax**
- Fax completed Form SS-4 + Certificate of Incorporation to a regional IRS office (number on the form; example for Dallas: 469-227-4000)
- Processing: ~4 business days
- Requirement: You must provide a contact telephone number and fax number; IRS will contact you to confirm before assigning EIN

**Method 3: Mail**
- Mail Form SS-4 + Certificate of Incorporation to the IRS service center for your region (see [Form SS-4 instructions](https://www.irs.gov/pub/irs-pdf/iss4.pdf), page 5)
- Processing: 4–5 weeks
- Slowest option; use only if phone/fax unavailable

#### Key Point for Non-Residents Without US SSN/ITIN

On Form SS-4, **Line 7b (SSN of principal officer/owner):** Foreign applicants can write **"N/A"** or **"Foreign"**. The IRS will still process the application and issue an EIN. This is one of the key advantages of the phone/fax method—the online system hard-rejects non-US SSN.

#### Timeline

**Recommendation for PlayableLabs:**
- Week 1 (incorporation): Receive Certificate of Incorporation from Firstbase (within 1–2 days after filing with Delaware).
- Week 1–2: Complete Form SS-4; call IRS phone line (267-941-1099) with Hoang Anh Tu (or Authorized Representative) on the call. Provide EIN over the phone immediately upon confirmation.
- Week 2–3: Receive formal EIN notice by mail (Form SS-4-R).
- Week 3: Open Mercury bank account using EIN.

**Do NOT delay this.** The phone method is 95% reliable and avoids mail delays.

### 2.3 Form 5472: Information Return of a 25% Foreign-Owned US Corporation

#### Requirement & Penalty

PlayableLabs **must file Form 5472** because:
- Hoang Anh Tu owns 47.1% (exceeds 25% threshold).
- Phan Trong Bach owns 32.2% (exceeds 25% threshold).

[IRS instructions for Form 5472](https://www.irs.gov/instructions/i5472) detail requirements.

**Penalties for non-filing are severe:**
- **$25,000 per occurrence** (per year, if filing is missed)
- **Additional $25,000 for each 90-day period after IRS notice** if not corrected
- **Aggregate penalty can exceed 50%+ of net income** if enforcement occurs

Form 5472 must be filed **with the corporate income tax return (Form 1120)** by **April 15** (or extended to October 15 if the corp files a Form 7004 extension request).

#### What Form 5472 Reports

This form reports **all reportable transactions** between PlayableLabs (US) and related parties during the tax year. Examples:
- Management fees paid by PlayableLabs to The One Game Studio HK or ByteonLab VN
- Royalties for IP licensed from HK entity to US entity
- Interest on intercompany loans
- Cost-sharing payments for R&D
- Transfer of goods or inventory between entities

**Key principle: Arm's length pricing required.** See § 2.4 below.

#### Practical Implications

- PlayableLabs must **document every intercompany transaction** with written agreements.
- The HK entity should invoice PlayableLabs for services (management, engineering, marketing services, etc.) at fair-market rates.
- PlayableLabs reports these payments on Form 5472 (Schedule O, Part V).
- **IRS uses Form 5472 data to audit transfer pricing** (IRC § 482 compliance). If rates are too low, IRS can adjust income and impose penalties.

### 2.4 Transfer Pricing — IRC § 482

When PlayableLabs pays The One Game Studio HK for engineering services, those payments must be at **arm's length prices**—the price an unrelated company would pay for the same services.

#### The Arm's Length Standard

[IRC § 482](https://www.irs.gov/businesses/international-businesses/transfer-pricing) authorizes the IRS to adjust transfer prices if they deviate from what uncontrolled parties would charge.

**Penalties for non-compliance:**
- **20% penalty** on the underpaid tax (if adjustment exceeds $5,000)
- **40% penalty** if the adjustment exceeds 10% of reported transfer price and the taxpayer failed to contemporaneously document the pricing (this is common)

#### Practical Approach for PlayableLabs

**For engineering services:**
- Determine: How many engineers at HK entity work on PlayableLabs business?
- Comparable rate: US market rates for similar engineers (location, seniority, complexity) = $60–120/hr in Vietnam + local employment taxes (~17% social insurance).
- Example: If ByteonLab VN has 3 full-time engineers @ $80/hr × 2,000 hrs/year = $480K billed annually to PlayableLabs.
- **Documentation:** Written Master Services Agreement (MSA) between PlayableLabs and ByteonLab VN, signed before the service year begins, specifying hourly rates, deliverables, and the method used to set rates (e.g., "comparable market analysis, Tech Worker report, Salary.com data").

**For management services:**
- Chief Operating Officer (Khuc Xuan Thao) splits time between HK entity and PlayableLabs (US).
- Allocation: If Khao spends 30% on PlayableLabs, charge 30% of her salary to PlayableLabs (fair market cost-sharing).
- **Documentation:** Timekeeping records or allocation memo signed by both CFOs.

**For IP licensing:**
- If HK entity owns IP (domain names, logos, prior code) licensed to PlayableLabs, the licensing fee should be set by reference to comparable licenses or a discounted-cash-flow analysis of the IP value.
- **Simple rule for startup stage:** License at 0% or nominal fee (e.g., $1/year) to bootstrap, with the understanding that a transfer pricing study will document this when the company scales or raises VC.

#### When a Transfer Pricing Study Is Required

**PlayableLabs should commission a formal transfer pricing study if:**
- Raising a Series A round (VCs require documented compliance).
- Intercompany payments exceed $1M annually.
- IRS has indicated transfer pricing interest in correspondence.

**Cost: $3K–$10K** for a qualified transfer pricing firm (Deloitte, EY, BDO, smaller boutiques).

**Timing: After Year 1 if committing to VC fundraising.**

### 2.5 Form 1120: US Corporate Income Tax Return

PlayableLabs files **Form 1120** ("U.S. Corporation Income Tax Return") annually, even if it has no income or losses.

#### Key Sections for Foreign-Owned Entities

| Section | Requirement | Notes |
|---------|-------------|-------|
| **Form 1120, Schedule K (line 11a)** | List all shareholders 5%+ | Must identify foreign vs. US persons and percentage ownership |
| **Form 1120, page 1** | Gross income from all sources | US business income; foreign-source income is NOT reported if it's foreign-earned by foreign entity |
| **Schedule J** | Income tax; rate = 21% flat (post-2017 Tax Cuts & Jobs Act) | No graduated rates |
| **Schedule M-1 / M-3** | Reconciliation of income to book income | Required if total assets > $10M; simplified M-1 otherwise |
| **Form 5472 attachment** | If 25%+ foreign shareholder, attach Form 5472 (see § 2.3) | Penalties if omitted |
| **Form 4720** (if applicable) | Certain excise taxes (e.g., executive compensation) | Usually not required at early stage |

**Due date:** April 15 following the end of the fiscal year (or October 15 if extension filed on Form 7004).

**PlayableLabs action:** Work with a US CPA (Stripe, Carta, or firms like EisnerAmper, CohnReznick specializing in foreign-owned corps) to prepare Form 1120 annually.

### 2.6 W-8BEN: Non-US Shareholder Certification

Each non-US shareholder must file a **W-8BEN** form with PlayableLabs (the payor) to establish foreign status and prevent 30% backup withholding on dividends.

#### Purpose & Validity

[W-8BEN](https://www.irs.gov/instructions/iw8ben) certifies that the shareholder is a non-US person and is the beneficial owner of the income (not a pass-through or nominee). Valid for **3 calendar years** from the date signed; must be renewed before expiration.

#### Process

1. **Each shareholder completes W-8BEN:**
   - Hoang Anh Tu — W-8BEN certifying Vietnam tax residency
   - Khuc Xuan Thao — W-8BEN certifying Vietnam tax residency
   - Phan Trong Bach — W-8BEN certifying Vietnam tax residency
   - Hoang Huu Tuan — W-8BEN certifying Vietnam tax residency
   - Le Huynh Cong Thao — W-8BEN certifying Vietnam tax residency

2. **Shareholders provide to PlayableLabs** (CEO or Finance) before any dividend payment.

3. **PlayableLabs records in shareholder file** and uses the W-8BEN to support **not withholding 30%** (well, withholding 0% absent a treaty reduction, which doesn't apply US-Vietnam).

**Critical note:** Because there is NO US-Vietnam tax treaty, the W-8BEN establishes foreign status but does **NOT reduce the 30% withholding rate**. The rate stays at 30% by default. W-8BEN is still required to document that PlayableLabs followed IRS rules when withholding.

#### What Happens Without W-8BEN?

Without a completed W-8BEN, the IRS can require PlayableLabs to **backup withhold 24%** (or 30% under prior rules; rates change). This is more expensive and triggers additional filing requirements. Get W-8BENs filed immediately after incorporation and update every 3 years.

### 2.7 State Income Tax & Nexus

#### California: The Key State for PlayableLabs

If PlayableLabs has a customer base, employees, contractors, or infrastructure (hosting, data centers) in California, it has **nexus** in CA and owes CA income tax.

**CA Franchise Tax:**
- **All corporations with CA nexus owe 8.84% corporate income tax** on California-source income.
- **Additionally, all corporations owe a minimum Franchise Tax of $800/year**, even with $0 income.

**CA Nexus thresholds (2025, inflation-adjusted):**
| Factor | Threshold | Notes |
|--------|-----------|-------|
| Sales | $757,070 | Any amount over this = presumed nexus |
| Payroll | $75,707 | CA wages, salary, bonuses |
| Property | $75,707 | Equipment, fixtures, lease values |

**Key point:** These are no longer "safe harbors"; CA FTB (Franchise Tax Board) takes the position that any sales, payroll, or property in CA creates nexus. [See CA FTB guidance](https://www.ftb.ca.gov/file/business/doing-business-in-california.html).

**PlayableLabs action:**
- **If PlayableLabs has no CA office, employees, or data centers:** No CA nexus presumed; file "foreign qualification" with CA Secretary of State ("Qualification to Do Business") as a precaution (~$150 fee, biennial renewal).
- **If PlayableLabs will hire a CA-based engineer or contractor:** File CA qualification immediately; pay $800 minimum Franchise Tax annually. Expect to owe 8.84% tax on the portion of net income attributable to CA.

#### Other States: Monitor Sales

Use [Avalara's Nexus Tool](https://www.avalara.com/us/en/learn/sales-tax/south-dakota-wayfair.html) or state-specific guidance once revenue is material. Most states with sales tax adopt the **Wayfair economic nexus thresholds** (see § 2.8).

### 2.8 Sales Tax & Wayfair Economic Nexus

After *South Dakota v. Wayfair* (2018), states can require remote sellers to collect and remit sales tax if they meet economic thresholds.

#### Standard Thresholds (per Wayfair)

[South Dakota's threshold](https://www.salestaxinstitute.com/sales_tax_faqs/waifair-economic-nexus) and most states' rules:

| Threshold | Quantity |
|-----------|----------|
| **OR** | $100K+ in sales/services into the state |
| **OR** | 200+ separate transactions into the state |

**PlayableLabs context (SaaS / Playable Ads):**
- Selling digital services (playable ads, SaaS tools) into a state → sales tax may apply if PlayableLabs crosses $100K revenue to that state.
- **Varies wildly by state:** Texas taxes SaaS heavily; California does NOT tax SaaS. [See CA FTB guidance](https://statetaxtools.com/states/california).
- **Safe approach:** Once PlayableLabs has $100K annual revenue from any single state, consult a tax advisor to determine if sales tax registration is required.

**For 2026 (startup phase, likely low revenue):** This is not an immediate concern but flagged for FY 2027/2028.

### 2.9 FIRPTA (Foreign Investment in Real Property Tax Act)

FIRPTA does **NOT** apply to PlayableLabs because:
- PlayableLabs is a digital-services company (playable ads, SaaS).
- FIRPTA applies only to US real estate held by foreign-owned entities (commercial buildings, land, leases).

**Not a concern for PlayableLabs.**

### 2.10 Permanent Establishment (PE) Risk for The One Game Studio HK

When PlayableLabs pays ByteonLab VN or The One Game Studio HK for services, or when HK employees work substantially for PlayableLabs' US business, there is a risk that:

1. The US claims **The One Game Studio HK has a PE (Permanent Establishment) in the US** — triggering US taxation of HK profits attributable to the PE.
2. Vietnam claims the **same income is also subject to Vietnam tax** (if HK entity failed to declare it).

#### Mitigation

- **Clear contractual separation:** Execute a Master Services Agreement (MSA) between PlayableLabs and ByteonLab VN specifying that ByteonLab provides services **from Vietnam, in Vietnam, for ByteonLab's own account**, not as an agent/employee of PlayableLabs.
- **No control by PlayableLabs:** ByteonLab retains sole discretion over staffing, work methods, tools, location.
- **Arm's length pricing:** As detailed in § 2.4.
- **Document the arrangement:** Store the MSA in PlayableLabs' corporate records and provide to accountants during tax prep.

This is low-risk if structured clearly, but **worth documenting upfront**.

### 2.11 CFC & PFIC (Controlled Foreign Corporation / Passive Foreign Investment Company)

**Not directly applicable to PlayableLabs now:**
- **CFC (IRC § 957):** Applies if US tax residents own 10%+ of a foreign corporation. Here, all shareholders are non-US residents, so CFC rules do not trigger now. **Flag:** If a shareholder later moves to the US (e.g., Tu immigrates), CFC rules may apply to HK entity holdings.
- **PFIC (IRC § 1297):** Applies if PlayableLabs (a US corporation) invests in the HK entity. If PlayableLabs has cash and buys HK entity shares, the HK entity becomes a PFIC. This is a complex regime with timing trap rules. **Avoidance:** Don't have PlayableLabs invest in HK entity; keep them separate operationally and capitally.

**Action:** Mention to US tax advisor when setting up accounting; revisit if shareholder residency changes.

### 2.12 Cost & Timeline Summary — Taxes

| Item | Cost | Timing | Recurrence |
|------|------|--------|-----------|
| Form SS-4 (EIN application) | $0 | Week 2–3 post-incorporation | One-time |
| Form 5472 (annual filing) | $0 (internal) | April 15 annually | Annual |
| Form 1120 (income tax return) | $1,500–3,000 (CPA) | April 15 annually | Annual |
| W-8BEN (shareholders) | $0 | Before 1st dividend | Every 3 years (renewal) |
| Transfer pricing study (if raised Series A) | $3K–10K | Year 1 or pre-Series A | As needed |
| Form 4720 / Other excise (unlikely early stage) | $0 | — | As triggered |
| State registrations (CA qualification, etc.) | $150–300 | When hiring / establishing nexus | Every 2 years (renewal) |
| **Year 1 tax setup** | **~$1,500–3,000** | — | Via CPA consultation |
| **Annual tax filing** | **~$2,000–3,500** | April 15 | Recurring |

### Action Items — Taxes (30 / 90 / 180 days)

**30 days:**
- File Form SS-4 via phone (267-941-1099). Obtain EIN.
- Gather W-8BEN forms from all 5 shareholders; file in corporate records.

**90 days:**
- Identify and engage a US CPA / tax firm specializing in foreign-owned corporations (firms: CohnReznick, EisnerAmper, BDO small-business practice, Stripe's recommended CPAs).
- Document intercompany service agreements (PlayableLabs ↔ ByteonLab VN) with hourly/monthly rates.

**180 days:**
- File Form 1120 for FY 2026 (if calendar year corp; due April 15, 2027).
- Plan transfer pricing study if Series A is anticipated in next 12–18 months.

---

