---
name: t1k:foreign-owned-tax
description: "US tax obligations for foreign-owned Delaware C-Corps — IRS Form 5472 ($25K/yr penalty if missed), EIN application via Form SS-4 for foreign applicants (no online process), W-8BEN per non-US shareholder, transfer pricing (IRC §482), state nexus (CA $757K threshold), 30% dividend withholding. Flags US-Vietnam no-treaty problem prominently."
keywords: [form 5472, irs 5472, ss-4, ein, ein application, foreign applicant, w-8ben, w8ben, withholding tax, transfer pricing, irc 482, form 1120, foreign-owned delaware, foreign-owned llc, 25 percent foreign ownership, fbar, firpta, cfc, pfic, beps, state nexus, california nexus, sales tax wayfair, us tax for foreign founders]
argument-hint: "[topic: ein | 5472 | w-8ben | transfer-pricing | state-nexus]"
effort: medium
version: 0.3.2
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-legal
protected: true
---

# Foreign-Owned US Corp Tax Obligations

Knowledge-base skill for US federal + state tax obligations of a Delaware C-Corporation with non-US-resident shareholders. Critical filing trap: **Form 5472 penalty is $25,000 per year per missed filing** with no income required to trigger it.

## Skill Scope

**IS:** Form-by-form filing guidance, deadlines, penalty schedules, transfer-pricing principles, state nexus thresholds, withholding-tax mechanics.

**IS NOT:** Substitute for a US CPA experienced with foreign-owned entities. Final tax returns must be reviewed by licensed professionals. This skill provides analysis + checklists.

## When to activate

| User asks about… | Primary reference |
|---|---|
| "Form 5472", "25% foreign-owned", "$25K penalty" | `references/foreign-owned-tax-obligations.md` § Form 5472 |
| "EIN application", "SS-4 form", "EIN for foreign founders" | `references/foreign-owned-tax-obligations.md` § EIN (SS-4) |
| "W-8BEN", "30% withholding", "Vietnamese shareholder tax" | `references/foreign-owned-tax-obligations.md` § W-8BEN + Withholding |
| "Transfer pricing", "intercompany services", "IRC 482" | `references/foreign-owned-tax-obligations.md` § Transfer Pricing |
| "California nexus", "state income tax", "Wayfair sales tax" | `references/foreign-owned-tax-obligations.md` § State Nexus |
| "FBAR", "FIRPTA", "CFC", "PFIC" | `references/foreign-owned-tax-obligations.md` § Edge cases |

## ⚠️ The 3 critical traps for foreign-owned Delaware corps

### 1. Form 5472 — $25K/year penalty per missed filing

**Required** when a US corporation has any 25%+ foreign shareholder OR engages in transactions with foreign related parties. Filed annually with Form 1120 (April 15).

- **Penalty: $25,000 per year, per missed filing**
- After IRS notice: additional $25,000 per 90-day period until compliance
- Information return only — no tax owed — but penalty applies even if filed late by one day

**Action:** confirm with US CPA that Form 5472 is on the filing checklist. Most foreign-owned entities miss this in year 1.

### 2. No US-Vietnam tax treaty

The single largest constraint for Vietnamese founders of US corps.

| Country pair | Dividend withholding | Source |
|---|---|---|
| US ↔ Vietnam | **30% — NO REDUCTION** | No treaty exists |
| US ↔ UK | 15% (5% if 10%+ owner) | US-UK DTA |
| US ↔ India | 25% (15% reduced) | US-India DTA |
| US ↔ Singapore | 15% | US-Singapore DTA |
| HK ↔ Vietnam | 5-10% reduced | HK-Vietnam DTA ✓ |

**Implication:** distributions from US Delaware corp to Vietnamese shareholders face 30% withholding with no relief. Plan capital flow accordingly — consider whether profits should flow Vietnam → HK → US (using HK-Vietnam DTA) instead of direct distributions.

### 3. EIN application for foreign founders — no online process

The IRS online EIN application **only works for US-resident applicants with a valid SSN/ITIN as the responsible party**. Foreign founders must use:

| Method | Timeline | Notes |
|---|---|---|
| **Phone** (267-941-1099) | 4–5 business days | Most reliable; line open 6am–11pm ET, Mon–Fri |
| **Fax** to (855) 641-6935 | ~4 business days | Lower volume than phone |
| **Mail** to IRS Cincinnati office | 4–6 weeks | Slowest; use only if other methods unavailable |
| Third Party Designee (TPD) | Same as above | TPD with US ITIN can apply on your behalf |

Common services like **Firstbase** and **Stripe Atlas** include EIN application as part of their bundle (often using TPD method).

## Quick reference — filing schedule

| Form | What | When | Penalty for miss |
|---|---|---|---|
| **SS-4** | EIN application | After incorporation (no fixed deadline, but needed for banking) | None per se — blocks operations |
| **Form 1120** | US corporate income tax | April 15 (or 6-month extension via Form 7004) | $210/month per shareholder (small corp); larger penalties for larger |
| **Form 5472** | Foreign-owned reporting | With Form 1120 (April 15) | **$25,000/year per filing** |
| **W-8BEN** | Per non-US shareholder | Before first distribution; renew every 3 years | 30% backup withholding on distributions |
| **State income tax** | Per nexus state | Varies (CA: April 15, FY-based) | State-specific |
| **Sales tax registration** | Per nexus state | Within 30 days of triggering nexus | State-specific |

## Action items (first 90 days)

1. **EIN via SS-4 phone line** — call (267-941-1099) within first week post-incorporation
2. **Engage US CPA experienced with foreign-owned entities** — costs $2K–3.5K/year for return + 5472
3. **W-8BEN for all 5 non-US shareholders** — collect before any distribution
4. **Draft intercompany services agreement** — for any cross-entity transactions (PlayableLabs ↔ ByteonLab VN, ↔ HK entity). Documents transfer-pricing position.
5. **Monitor CA nexus thresholds** — $757,749 in CA sales (2025) triggers franchise tax + income tax filing
6. **FinCEN BOI report** — within 30 days of incorporation (2024+ rule)

## Companion skills

- **`t1k-delaware-incorporation`** — DGCL, Cert of Inc, franchise tax
- **`t1k-us-business-banking`** — Mercury/Stripe activation depends on EIN
- **`t1k-cap-table-admin`** — 83(b) elections (30-day strict deadline; affects shareholder tax)
- **`t1k-hk-corp`** — HK-Vietnam treaty + offshore claim mechanics

## See also

- Full research document: `references/foreign-owned-tax-obligations.md`
- Citations: `references/citations.md`
- IRS Form 5472 instructions: https://www.irs.gov/forms-pubs/about-form-5472
- IRS EIN for international applicants: https://www.irs.gov/businesses/small-businesses-self-employed/how-to-apply-for-an-ein
