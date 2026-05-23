---
name: t1k:delaware-incorporation
description: "Delaware C-Corp incorporation guide — DGCL essentials, Certificate of Incorporation drafting, two-class share structure, bylaws, franchise tax calculation (CRITICAL: Authorized Par Value Method saves ~$84K/yr vs Authorized Shares Method), annual reports, registered agent requirements. Written for foreign founders incorporating a Delaware C-Corp."
keywords: [delaware, dgcl, incorporation, certificate of incorporation, cert of inc, bylaws, two-class shares, common preferred, par value, authorized shares, franchise tax, annual report, registered agent, delaware general corporation law, c-corp, foreign-owned delaware corp, firstbase, stripe atlas]
argument-hint: "[topic: cert-of-inc | bylaws | franchise-tax | annual-report]"
effort: medium
version: 0.3.2
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-legal
protected: true
---

# Delaware C-Corp Incorporation Guide

A knowledge-base skill for incorporating a Delaware C-Corporation — particularly for **foreign founders** with non-US shareholders. Covers DGCL essentials, drafting decisions, ongoing compliance, and the franchise-tax trap that catches most new entities.

## Skill Scope

**IS:** Framework + methodology for incorporation choices (par value, share count, classes), DGCL section citations, fee schedules, deadline tracking, action plans for first-year setup.

**IS NOT:** A substitute for Delaware corporate counsel. Final filings (Certificate of Incorporation, bylaws, board resolutions) should be reviewed by a licensed attorney. This skill provides input + analysis, not legal sign-off.

## When to activate

| User asks about… | Primary reference |
|---|---|
| "Delaware incorporation", "DE C-Corp", "Firstbase setup" | `references/dgcl-essentials.md` |
| "Certificate of Incorporation", "Cert of Inc drafting", "two-class shares" | `references/dgcl-essentials.md` (Cert of Inc section) |
| "Authorized shares", "par value", "common vs preferred" | `references/dgcl-essentials.md` (Share structure section) |
| "Delaware franchise tax", "franchise tax calculation", "APV method" | `references/dgcl-essentials.md` (Franchise Tax section) |
| "DE annual report", "Form 141", "March 1 deadline" | `references/dgcl-essentials.md` (Annual Compliance section) |
| "Registered agent", "DE Division of Corporations" | `references/dgcl-essentials.md` (Reg agent section) |
| "Foreign qualification", "doing business in California", "CA nexus" | `references/dgcl-essentials.md` (Foreign Qualification section) |

## Critical decisions (read carefully)

### 1. Franchise tax — use Authorized Par Value Method (APV), NOT Authorized Shares (AS)

This is the single biggest cost-saver and most common mistake.

| Method | 10M authorized at $0.0001 par, $100K gross assets | Annual cost |
|---|---|---|
| **Authorized Shares (AS) — default if you don't elect** | Calculated on share count | **~$85,000** |
| **Assumed Par Value (APV) — must elect** | Calculated on assets × authorized/issued ratio | **~$400 (minimum)** |

If your Cert of Inc doesn't specify low par value ($0.0001 is standard), you cannot elect APV and pay the full AS amount. **Always specify par value in the Cert of Inc.**

See: `references/dgcl-essentials.md` § Franchise Tax Calculation for the full math + worked example.

### 2. Two-class share structure — Common + Preferred

Standard for VC-backed startups. Founders + employees hold Common; investors hold Preferred with:
- 1x non-participating liquidation preference (standard)
- Anti-dilution (narrow-based weighted average — most common; broad-based weighted average — founder-friendlier; full ratchet — investor-friendliest, rare)
- Pro-rata rights for follow-on rounds
- Customary protective provisions (drag-along, tag-along, ROFR)

The exact terms go into the **Certificate of Designations** (filed with DE Division of Corporations) — separate from the base Certificate of Incorporation. Requires lawyer drafting (~$1.5K–3K).

### 3. Authorized share count — typical 10,000,000

Standard for Delaware C-Corp first incorporation:
- 10M authorized total
- ~7-8M issued to founders + initial shareholders
- 2-3M reserved for option pool (employee + advisor grants)

Higher authorized counts (50M+) only matter if you plan a 10-to-1 stock split later or anticipate massive option-pool expansion. Default to 10M.

## Action items (first 30 days)

1. **Confirm par value** in Cert of Inc — $0.0001 typical
2. **Authorized share count** — default 10M unless reason to deviate
3. **Two-class structure** — if mirroring an existing offshore cap table, file Cert of Designations alongside; if just founders + future SAFEs, file Common-only and amend later
4. **Registered agent** — Firstbase / Stripe Atlas provides first year; switch to standalone RA (~$200–400/yr) for year 2+
5. **Initial board resolutions** — draft alongside Cert of Inc filing: adopt bylaws, appoint officers, authorize bank account, issue founders' shares, adopt option plan
6. **Foreign qualification** — register in any state where you have employees, physical presence, or significant sales (CA is the most common trigger)

## Critical deadlines

| Item | When | Penalty for miss |
|---|---|---|
| **DE Annual Report + Franchise Tax** | March 1 every year | $200 + 1.5%/month interest |
| **EIN application** (for foreign-owned) | After incorporation | None per se, but blocks banking |
| **Beneficial Ownership Information (FinCEN BOI)** | Within 30 days of incorporation (2024+ rule) | $500/day, max $10K + criminal |

## Companion skills

- **`t1k-foreign-owned-tax`** — Form 5472, EIN application for foreign-owned, W-8BEN per shareholder, US-Vietnam no-treaty issue
- **`t1k-us-business-banking`** — Mercury, Brex, Stripe Atlas for foreign-owned DE corps
- **`t1k-cap-table-admin`** — Cap-table tools (Pulley, Carta), 83(b) elections, 409A valuations, SAFEs
- **`t1k-hk-corp`** — if also operating a Hong Kong sister entity

## See also

- Full research document with statute citations + verified URLs: `references/dgcl-essentials.md` + `references/citations.md`
- Delaware Division of Corporations: https://corp.delaware.gov/
- DGCL full text: https://delcode.delaware.gov/title8/c001/index.html
