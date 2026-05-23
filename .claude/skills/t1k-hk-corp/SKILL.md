---
name: t1k:hk-corp
description: "Hong Kong private company operations guide — Companies Ordinance (Cap. 622), no-par-value share system, two-tier profits tax (8.25% first HK$2M, 16.5% above), territorial taxation + offshore claim, annual NAR1 filing (42-day rule), Business Registration renewal, audited accounts (mandatory all sizes), no-treaty-with-Vietnam exceptions, share allotment process, HK-Vietnam DTA. Written for foreign founders running a HK Ltd."
keywords: [hong kong company, hong kong private limited, hk ltd, cap 622, companies ordinance hk, hkco, profits tax hong kong, hk ird, inland revenue department hk, offshore claim hk, dipn 21, nar1, annual return hk, business registration hk, br renewal, hk audited accounts, hk corp secretary, glac, tricor, boardroom, hk-vietnam dta, hk vietnam tax treaty, no par value, share allotment hk, nsc1, scr significant controllers register hong kong]
argument-hint: "[topic: incorporation | profits-tax | nar1 | offshore-claim | share-allotment | cross-border]"
effort: medium
version: 0.3.2
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-legal
protected: true
---

# Hong Kong Private Company Operations

Knowledge-base skill for incorporating + operating a Hong Kong private company limited by shares — particularly for **foreign founders** (e.g., Vietnamese citizens) using HK as their operating company HQ. Critical advantages: territorial taxation, no FX controls, HK-Vietnam DTA.

## Skill Scope

**IS:** Framework + methodology for HK Cap. 622 compliance, profits tax planning, annual filings, corp-sec engagement, cross-border structuring with US/Vietnam.

**IS NOT:** Substitute for HK-licensed corporate counsel, company secretary, or CPA. Final filings and audits must be by HK-licensed professionals.

## When to activate

| User asks about… | Primary reference |
|---|---|
| "HK incorporation", "Cap 622", "private company limited" | `references/hk-corp-essentials.md` § Companies Ordinance |
| "HK profits tax", "8.25%", "two-tier tax rate" | `references/hk-corp-essentials.md` § Tax |
| "offshore claim", "non-HK sourced profits", "DIPN 21" | `references/hk-corp-essentials.md` § Offshore claim |
| "annual return HK", "NAR1", "42-day rule" | `references/hk-corp-essentials.md` § Annual compliance |
| "share allotment HK", "NSC1", "issuing new shares" | `references/hk-corp-essentials.md` § Share allotment |
| "HK-Vietnam tax treaty", "HK-VN DTA" | `references/hk-corp-essentials.md` § Cross-border |
| "GLAC", "Tricor", "company secretary HK" | `references/hk-corp-essentials.md` § Corp secretary |

> **Reference:** `references/hk-corp-essentials.md` contains the comprehensive 5,800-word HK corporate operations guide with full statute citations (Cap. 622, IRO Cap. 112), current fee schedules, and HK-Vietnam DTA mechanics.

## ⚠️ The 3 critical things to understand

### 1. Territorial taxation = the dominant strategic advantage

Unlike the US (worldwide taxation), HK only taxes **HK-sourced profits**. If your value-creating activities happen outside HK (e.g., dev team in Vietnam, customers in US/EU), you can file an **offshore claim** for 0% HK profits tax on those earnings.

- **Two-tier rates:**
  - First HK$2M of HK-sourced profits: **8.25%**
  - Above HK$2M: **16.5%**
  - Only ONE entity in a group can use the lower rate (group-level election)
- **Offshore claim mechanics:** IRD scrutinizes; need documentation of where value is created. Cite DIPN 21 (Departmental Interpretation and Practice Notes No. 21).
- **Common scenario:** if dev team is in Vietnam (ByteonLab), customers are global, and only the company office + bank are in HK, the operating profit likely qualifies as offshore.

### 2. HK-Vietnam Double Taxation Agreement (DTA) — exists, with reductions

| Cross-border flow | Withholding |
|---|---|
| **HK → Vietnam (dividends)** | **0% from HK** (no WHT on outbound divs); Vietnam side may tax recipient |
| **Vietnam → HK** | Vietnam imposes WHT on outbound; DTA reduces (typically 5-10% on dividends, 5-10% on royalties) |
| **HK ↔ Vietnam (interest, royalty)** | DTA reduces; see DTA Articles 10/11/12 |

**Compare to US:** no US-Vietnam treaty exists. So distributions to Vietnamese shareholders flow much more cleanly via HK than via US.

### 3. Audited financial statements are mandatory — for ALL HK companies

Regardless of size, every HK private company must produce audited financial statements annually by a **HK-licensed CPA**.

- Cost: **HK$15,000–50,000/year** depending on transaction volume + complexity
- Audit deadline: ready for AGM (within 9 months of FYE; or written resolution)
- This is a significant ongoing cost not always anticipated by foreign founders

## Annual compliance calendar

| Item | When | Cost |
|---|---|---|
| **Business Registration Certificate (BR) renewal** | Annually on registration anniversary | HK$2,200 |
| **Annual Return NAR1** | Within 42 days of incorporation anniversary | HK$105 (on-time); HK$870–3,480 if late |
| **Profits Tax Return BIR51** | 1 month after IRD issues notice (typically April–May) | $0 (filing fee); audit cost separate |
| **Audited accounts** | Ready for AGM (9 months post-FYE) | HK$15K–50K |
| **Particulars changes** (officers, address, articles) | Within 14 days of change | HK$105 per filing |
| **AGM** | Within 9 months of FYE (or written resolution) | $0 |

## Corp secretary services

Most foreign-founded HK companies use a **TCSP/CSP** (Trust or Company Service Provider). Common choices:

| Provider | Cost | Notes |
|---|---|---|
| **GLAC (Global Link Asia Consulting)** | HK$6–12K/year | Singapore-based; used by The One Game Studio. Vietnamese support. |
| **Tricor** | HK$10–15K/year | Mid-size; good for growing companies |
| **Boardroom** | HK$12–18K/year | Singapore-headquartered; full multi-jurisdiction |
| **CC Corporate** | HK$5–10K/year | Budget HK option |

Services typically include: registered office, company secretary, annual return filing, share allotment paperwork, particulars changes.

## Cross-border with US Delaware sister (PlayableLabs Inc. context)

If you have both an HK Ltd + a Delaware Inc., the structure matters:

| Structure | Pros | Cons |
|---|---|---|
| **Sister entities** (current) | Simple; each entity taxed independently | Intercompany transfers require arm's-length pricing |
| **DE holds HK** (US-on-top) | VC-investor friendly; clean US fundraising path | Triggers US tax on HK profits when distributed up |
| **HK holds DE** (HK-on-top) | HK territorial taxation may shelter US profits | VCs prefer DE-on-top; HKEX-only IPO path |

**Most common transition:** start as sister entities, restructure to DE-on-top before US-led Series A (~$20–40K legal cost). Section 351 of US tax code allows tax-free contribution; HK side requires stamp duty 0.26% of NAV on the share transfer.

## Action items

### First 30 days
1. Confirm registered office + corp-sec contract (GLAC, etc.)
2. Verify BR certificate is current
3. Open USD operating bank account (Airwallex / Payoneer / HSBC) — Airwallex easiest for foreign founders
4. Maintain Significant Controllers Register (SCR) internally

### Annual cadence
1. Renew BR every year
2. File NAR1 within 42 days of incorporation anniversary
3. Engage HK-licensed CPA for audit + profits tax return
4. AGM (or written resolution) within 9 months of FYE
5. Update SCR for any ownership changes

### Cross-border considerations (with DE sister)
1. Written intercompany services agreement between HK + DE + ByteonLab VN
2. Transfer pricing study (~HK$25–80K) if revenue > HK$400M or material related-party transactions
3. Master File + Local File for BEPS Action 13 compliance (large groups only)
4. Monitor PE risk — clear contracting scope to avoid "HK has PE in US" or vice versa

## Companion skills

- **`t1k-delaware-incorporation`** — DE sister entity setup
- **`t1k-foreign-owned-tax`** — US side of cross-border (5472, transfer pricing)
- **`t1k-cap-table-admin`** — HK cap-table is simpler than US; this skill mainly relevant for the DE entity

## See also

- Full research: `references/hk-corp-essentials.md` (populated on next release)
- HK Companies Registry: https://www.cr.gov.hk
- HK Inland Revenue Department: https://www.ird.gov.hk
- HK Cap. 622 full text: https://www.elegislation.gov.hk/hk/cap622
- HK-Vietnam DTA: https://www.ird.gov.hk/eng/pdf/dta_vietnam.pdf
