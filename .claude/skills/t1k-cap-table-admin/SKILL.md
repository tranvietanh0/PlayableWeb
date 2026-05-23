---
name: t1k:cap-table-admin
description: "Cap-table + equity administration for US/foreign C-Corps — Carta vs Pulley vs AngelList Stack comparison, 83(b) elections (30-day strict deadline, NO extensions), 409A valuations ($1.5-3K), SAFE notes (YC post-money template), Series Seed terms, vesting agreements, founder reverse vesting. Pre-Series A: DIY spreadsheet or Pulley Startup ($1,200/yr) sufficient."
keywords: [cap table, capitalization table, carta, pulley, angellist stack, 83b election, 83b, 409a valuation, 409a, vesting, vesting agreement, founder vesting, reverse vesting, safe note, safe, y combinator, ycombinator, series seed, series a, option pool, isos, nso, employee stock options, esop, equity admin, share register, stock certificate, restricted stock]
argument-hint: "[topic: cap-table-tool | 83b | 409a | safe | vesting]"
effort: medium
version: 0.3.2
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-legal
protected: true
---

# Cap-Table + Equity Administration

Knowledge-base skill for managing the capitalization table and equity grants of a Delaware C-Corp (or comparable structure). Covers cap-table tools, IRS 83(b) elections, 409A valuations, SAFEs, and vesting mechanics.

## Skill Scope

**IS:** Tool comparison, mechanics + math of equity grants, election timing, sample term sheets, tax-trigger analysis.

**IS NOT:** A substitute for securities counsel or a registered investment adviser. Final cap-table actions (option grants, SAFE issuance, secondary transactions) should be reviewed by attorneys. This skill provides analysis.

## When to activate

| User asks about… | Primary reference |
|---|---|
| "cap table tool", "Carta vs Pulley", "AngelList Stack" | `references/cap-table-equity-admin.md` § Tools |
| "83(b) election", "83b deadline", "advisor grant 83b" | `references/cap-table-equity-admin.md` § 83(b) |
| "409A valuation", "FMV common stock", "option strike price" | `references/cap-table-equity-admin.md` § 409A |
| "SAFE note", "YC SAFE", "post-money SAFE" | `references/cap-table-equity-admin.md` § SAFEs |
| "vesting schedule", "founder vesting", "reverse vesting" | `references/cap-table-equity-admin.md` § Vesting |
| "Series Seed", "Series A", "term sheet" | `references/cap-table-equity-admin.md` § Priced rounds |
| "option pool", "ISO", "NSO" | `references/cap-table-equity-admin.md` § Option plan |

## TL;DR — staged maturity

| Stage | Cap-table | Equity admin |
|---|---|---|
| **Pre-Seed (just founders)** | DIY spreadsheet | Just founder grants with vesting agreements |
| **Seed (with angels/advisors)** | Pulley Startup ($1,200/yr) | + Advisor grants with 83(b) elections, vesting |
| **Pre–Series A (with employees)** | Pulley Growth ($3,500/yr) or Carta | + 409A valuation + ISO option plan |
| **Series A+** | Carta (industry standard for VC reporting) | + Full board reporting + waterfall analysis |

## ⚠️ Critical: 83(b) election — 30-day STRICT deadline

The 83(b) election is the most expensive tax mistake foreign-founders make on US grants.

### What it does

Without 83(b): you're taxed as shares **vest** — at the then-current FMV, as ordinary income. If the company grows, this can mean massive tax bills on illiquid stock.

With 83(b): you're taxed at the **grant date** at the (low) FMV, future appreciation = capital gains.

### The deadline

**30 days from the grant date. No extensions. No exceptions.**

- File via mail (certified return-receipt) to the IRS service center where you would file your annual return
- Send a copy to the issuing company
- Keep the certified-mail receipt as proof of timely filing (the IRS doesn't acknowledge receipt)

### When it matters

| Grant type | 83(b) typically? |
|---|---|
| Founder stock with vesting (reverse vesting) | **Yes** — file immediately |
| Advisor grant (restricted stock) | **Yes** |
| Options (ISO/NSO) | **NO** — 83(b) is for restricted stock, not options |
| Already-vested stock | NO — 83(b) only for unvested portions |
| Future issuance (e.g., upon employment) | **Yes — file within 30 days of issuance** |

### Action for PlayableLabs context

Tu, Khuc, Bach, Tuan, Le Huynh Cong Thao all have HK shares already vested. The **new Delaware issuance** restarts the clock for US tax purposes. **File 83(b) within 30 days of any Delaware grant date** — even if the grant mirrors a previously-vested HK position. Safer than not filing.

## 409A valuation — needed before granting employee options

You don't need a 409A for founder/advisor grants if the grants happen at incorporation (no IRS issue). You DO need a 409A before granting options at any other time:

| Stage | 409A FMV typical | Cost |
|---|---|---|
| Pre-revenue, just founders | $0.01–$0.10/share | $1.5K–3K from boutique providers |
| Seed-stage with revenue | $0.05–$0.30/share | $1.5K–3K |
| Post-Series A | Driven by preferred-pref price | $3K–5K (Carta includes for Cap-Table-Plus plan) |

Valuation good for **12 months** (or until a material event — new round, M&A interest, major hire). After expiry, options granted at expired-409A price are taxable to recipient.

## SAFEs — the YC post-money template

For first US-priced capital raise, the **Y Combinator Post-Money SAFE** is industry standard. Key terms:

| Term | Typical |
|---|---|
| **Valuation Cap** | Pre-money / post-money valuation ceiling |
| **Discount** | 10–25% off the next priced round |
| **MFN (Most-Favored-Nation)** | Most early-stage SAFEs include MFN — if a later SAFE gets better terms, you ratchet up |
| **Pro-rata rights** | Side letter — gives investor right to maintain ownership % in next round |

YC publishes free templates at https://www.ycombinator.com/documents.

## Vesting — standard 4-year with 1-year cliff

| Period | What vests |
|---|---|
| 0–12 months | Nothing (cliff) |
| Month 12 | 25% vests in a single chunk (the cliff) |
| Months 13–48 | Remaining 75% vests monthly in equal installments (2.083% per month) |
| Month 48 | Fully vested |

### Founder reverse vesting

Founders' shares are issued at incorporation as restricted stock. The company has a **buyback right** for unvested shares at the original purchase price. If a founder leaves before fully vesting, the company can buy back the unvested portion at $0.0001/share (par value).

Critical for protecting against "the founder who left after 6 months but kept their full equity stake" scenario.

### Single-trigger acceleration on Change of Control

Standard for advisor grants and increasingly for founders: if the company is acquired before full vesting, 100% of unvested shares accelerate. Document this in the Vesting Agreement.

## Action items (90-day horizon)

1. **Pulley Startup account** — $1,200/yr; populate with current cap table
2. **Founder Stock Purchase Agreements** with reverse vesting — for each founder
3. **83(b) elections** — within 30 days of any Delaware grant date
4. **Vesting agreements for advisors** (Tuan + Le Huynh Cong Thao) — mirror HK advisor agreement terms
5. **(If hiring US employees Q4 2026)** 409A valuation + ISO option plan + board adoption resolution

## Companion skills

- **`t1k-delaware-incorporation`** — issuance of founders' shares ties to Cert of Inc
- **`t1k-foreign-owned-tax`** — 83(b) tax implications + W-8BEN per shareholder
- **`t1k-us-business-banking`** — Mercury required before issuing checks for option exercises

## See also

- Full research: `references/cap-table-equity-admin.md`
- Citations: `references/citations.md`
- Y Combinator SAFE templates: https://www.ycombinator.com/documents
- Pulley pricing: https://pulley.com/pricing
- Carta pricing: https://carta.com/pricing
