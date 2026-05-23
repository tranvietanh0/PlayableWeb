---
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-legal
protected: true
---

## Section 1: DGCL Incorporation Essentials

### 1.1 Why Delaware?

Delaware General Corporation Law (DGCL), codified in [Title 8 of the Delaware Code](https://delcode.delaware.gov/title8/), is the jurisdiction of choice for approximately 67% of Fortune 500 companies and 85% of US venture-backed startups. Why?

- **Predictable law**: 125+ years of case law interpreting DGCL; Delaware courts (Chancery Court) specialize in corporate disputes.
- **Startup-friendly:** Pro-business statutory default rules, flexible voting structures, and low franchise tax for efficient cap structures.
- **VC standard:** Nearly all institutional investors require Delaware incorporation. It signals professionalism and reduces investor due-diligence friction.
- **No state business activity requirement:** A Delaware corp can be entirely foreign-owned and foreign-operated without triggering Delaware income tax.

### 1.2 Certificate of Incorporation — Two-Class Structure

The Certificate of Incorporation is your company's foundational document, filed with the Delaware Division of Corporations. Under [DGCL § 102](https://codes.findlaw.com/de/title-8-corporations/de-code-sect-8-102/), the Certificate must specify:

#### Authorized Shares

PlayableLabs' structure mirrors The One Game Studio HK:

```
Total Authorized: 10,000,000 shares
├─ Common Stock: 6,000,000 shares (~$0.0001 par value)
└─ Preferred Stock Series A: 4,000,000 shares (undesignated; details in Certificate or Board resolutions)
```

Par value of $0.0001 is industry-standard for startups—low enough to minimize franchise tax under the Authorized Shares Method (see § 1.5 below) and to allow low-cost founder and option grants without triggering 409A issues.

#### Two-Class Voting Structure

- **Common Stock:** One vote per share; liquidation priority (last in line); conversion rights to Preferred upon IPO.
- **Preferred Stock Series A:** Designated in Certificate or Board resolutions; typically:
  - **1x non-participating liquidation preference** (receive $1 per share invested, then nothing else on liquidation unless converting to Common).
  - **Weighted-average anti-dilution** (Broad-based: new price = old price × (old shares outstanding + new funds/$old price) / (old shares + new shares)).
  - **Pro-rata rights** (investor can buy its percentage in future rounds to avoid dilution).
  - **Drag-along rights** (if majority shareholders + board approve a sale, minority shareholders must participate at the same terms).
  - **Tag-along rights** (minority shareholders can sell their shares on the same terms as majority in a majority-approved sale).
  - **ROFR** (Right of First Refusal: company can block or match any shareholder's proposed outside sale).
  - **Conversion to Common** on IPO (1:1 typically).

#### Liquidation Preferences

For a seed-stage company with Preferred already issued (Phan Trong Bach, Hoang Huu Tuan, Le Huynh Cong Thao), use **1x non-participating**:

**At liquidation:** If proceeds = $10M:
- Preferred holders get first $1M (their invested amount × 1x).
- Remaining $9M distributed pro-rata to all shareholders based on Common holdings.
- This is **founder-friendly**; full participation is more investor-friendly but rare at seed.

#### Anti-Dilution

**Narrow-based weighted-average** is default for seed/Series A; broad-based is standard by Series B+.

Formula:
```
New price = Old price × (Old common + New funds/Old price) / (Old common + New shares)
```

#### Drag-Along & Tag-Along

Include both. Drag-along allows majority holders (≥50%) + board to force all shareholders to sell on the same terms (critical for exit). Tag-along protects minority shareholders if majority decides to sell (guarantees they get pro-rata proceeds).

### 1.3 Bylaws & Board Governance

Bylaws are internal operating rules. Key sections:

- **Board composition:** PlayableLabs should authorize 3 directors initially (Hoang Anh Tu + 2 investor seats or nominees). Larger boards (5-7) come later with institutional investors.
- **Shareholder meetings:** Annual meeting + special meetings. Foreign shareholders can participate via video/phone; Delaware allows action by written consent (no formal meeting needed) if all shareholders agree.
- **Indemnification:** Standard: Delaware allows broad indemnification of directors/officers for good-faith acts, including negligence (but not willful misfeasance or statutory violations). Reduces litigation risk.
- **Officers:** President, Secretary, Treasurer minimum (Hoang Anh Tu can hold multiple offices initially).

### 1.4 Initial Board Resolutions

Within 30 days of incorporation, the Board should pass formal resolutions:

1. **Adopt Bylaws** (already drafted by counsel or Firstbase).
2. **Appoint officers:** CEO (Hoang Anh Tu), CFO/Treasurer, Secretary.
3. **Authorize stock issuance:**
   - Issue **founders' shares** to Tu + Thao (Common, vesting 4 years with 1-year cliff; reverse vesting so company can buy back unvested shares if founder leaves).
   - Issue **Preferred shares** to Bach, Hoang Huu Tuan, Le Huynh Cong Thao (terms per SAFE or earlier financing memo).
4. **Authorize option plan:** Board authorizes ESOP (Employee Stock Option Plan) reservoir (typically 15-20% of fully-diluted cap table for employee grants). When options grant, prepare 83(b) election docs.
5. **Authorize bank account:** Board approval + documentation for Mercury/Stripe banking (required by KYC).
6. **File corporate records:** Bylaws, cap table, option plan, resolutions stored in corporate records book (physical or DocuSafe digital).

### 1.5 Delaware Franchise Tax — Critical Math

PlayableLabs must pay Delaware annual franchise tax on March 1 each year. Two calculation methods; choose the lower:

#### Method 1: Authorized Shares Method (AS)

Tax = (Authorized shares / 1,000,000) × $85,000 (approximately, varies by bracket)

For PlayableLabs with 10,000,000 authorized:
```
Tax = (10,000,000 / 1,000,000) × $85,000 = $85,000 / year
```

This is **expensive**. See the official [Delaware Franchise Tax brackets](https://delcode.delaware.gov/title8/c006/sc05/).

#### Method 2: Assumed Par Value Method (APV)

For corporations that do NOT specify a par value for all classes, Delaware assumes a $0.125 par and calculates based on **gross assets**, not authorized shares. Formula:

```
Tax = (Total assets in Delaware × Par value per share) / 1,000,000 × Tax rate
Minimum = $400 (or $175 for very small entities if par value ≤ $0.001)
```

For PlayableLabs (early stage, minimal assets, $0.0001 par):
```
Assumed par = $0.125 (Delaware default for no-par shares)
If assets = $500,000: Tax = ($500,000 × $0.125) / 1,000,000 × $85K ≈ ~$5–10K + overhead
BUT minimum typically hits first: $400/year
```

**Recommendation: Use APV.** Certificate should specify **$0.0001 actual par value** (not "no par"), which allows Delaware to apply the $400 minimum tax under APV rather than the $85,000+ Authorized Shares Method. This saves ~$84,600/year initially and compounds as you scale.

**Procedure:**
- Update Certificate to specify "$0.0001 par value per share" for Common and Preferred (or "no par; assume $0.0001").
- File a Certificate of Amendment with Delaware ($85 fee) if not already specified in original Certificate.
- On annual Form 141 (due March 1 with tax payment), elect APV method explicitly.

### 1.6 Annual Compliance

- **Delaware Annual Report (Form 141):** Due March 1; $50 filing fee. Names registered agent, lists directors/officers, reports franchise tax election method. Can be filed online via [Delaware Division of Corporations](https://dnrec.delaware.gov/dnrec-online/) (actually filed via DNREC portal, not this link; use [this portal](https://delcode.delaware.gov/title8/c006/sc04/)).
- **Amendment filing:** If cap table changes (new share issuance, Preferred conversion, reverse split, etc.), file a Certificate of Amendment ($85 fee). Example: Issuing Series B Preferred requires a Certificate Amendment specifying new series terms.

### 1.7 Foreign Qualification (Multi-State Registration)

PlayableLabs is incorporated in Delaware but must "qualify to do business" in states where it has a physical presence or significant nexus. For PlayableLabs (Playable Ads / SaaS from the US, serving US customers):

- **California:** Likely required if PlayableLabs will have a CA office, bank account, or in-state contractors. File Form LLC-1 (or S/I-1 for corporations) with California Secretary of State (~$150-$200 fee; renewable every 2 years).
- **Other states:** No requirement unless you operate therein (employ people, have office, lease equipment, etc.).

**Timeline:** Within 90 days of doing business in a state, file foreign qualification to avoid penalties. Practical: file California only when you hire a CA-based employee or contractor.

### 1.8 Registered Agent & Address

Delaware requires a **registered agent** (physical person or service company) and a **Delaware business address** (must be a physical street address, not a mailbox). 

**Options:**
- **Firstbase Agent**: $299/year for the first year (included in $399 Firstbase Start fee); ~$200–300/year after.
- **Cogency Global**: $150–250/year. Standard choice for larger startups.
- **CSC, National Registered Agents, CT Corporate**: ~$200–400/year.
- **In-person registered agent:** If you have a Delaware law firm, they may provide this gratis as part of incorporation counsel.

PlayableLabs should use Firstbase Agent initially (included in $399 fee), then switch to Cogency (~$200/year) in Year 2 to save ~$100/year.

### 1.9 Cost Summary — First Year + Ongoing

| Item | Cost | Timing | Notes |
|------|------|--------|-------|
| Firstbase Start fee | $399 | One-time | Covers DE filing, EIN app, bylaws, initial resolutions |
| DE filing fee | $85 | Included in Firstbase | Delaware Division of Corporations |
| Registered Agent (Firstbase Year 1) | Included | Year 1 | $299–300/year thereafter |
| Delaware Business Address (optional, separate) | $0–500/year | Optional | Firstbase Mailroom $35/mo if you need mail forwarding |
| DE Franchise Tax Year 1 (APV minimum) | $400–500 | Due March 1 (Year 2) | Assumes APV method; Authorized Shares = ~$85K |
| DE Annual Report filing | $50 | Due March 1 annually | Online, trivial cost |
| **Subtotal Year 1** | **~$934** | — | No VC round yet |
| **Subtotal Year 2+** | **~$650–750/year** | — | Registered agent + franchise tax + annual report |

---

