---
name: t1k:us-business-banking
description: "US business banking for foreign-owned Delaware C-Corps — Mercury (foreign-founder-friendly), Stripe (payments), Wise/Airwallex (multi-currency), Brex/Chase comparison, KYB/KYC requirements, common rejection reasons. Recommended sequence: EIN → Mercury → Stripe → Wise. Mercury approval 1-4 weeks."
keywords: [mercury bank, mercury banking, brex, stripe atlas, stripe payments, wise business, airwallex, chase business, bank of america, us business bank account, foreign-owned banking, kyb, kyc, ubo verification, delaware c-corp bank account, foreign founder banking, fintech, neobank]
argument-hint: "[topic: mercury | stripe | wise | brex | rejection-reasons]"
effort: small
version: 0.3.2
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-legal
protected: true
---

# US Business Banking for Foreign-Owned Delaware C-Corps

Knowledge-base skill for opening + operating US business banking infrastructure when all shareholders are non-US-resident. Critical because most traditional US banks (Chase, BofA, Wells Fargo) reject foreign-owned applications.

## Skill Scope

**IS:** Bank/payment-processor comparison, KYB/KYC checklist, application timeline, common rejection reasons, banking strategy across multiple entities.

**IS NOT:** Substitute for direct bank application or financial advice. Final account terms are between you and the bank.

## When to activate

| User asks about… | Primary reference |
|---|---|
| "Mercury", "Mercury Bank application", "Mercury for foreign founders" | `references/banking-payment-infrastructure.md` § Mercury |
| "Brex", "Brex for foreign-owned" | `references/banking-payment-infrastructure.md` § Brex |
| "Stripe Atlas", "Stripe payments setup", "KYB" | `references/banking-payment-infrastructure.md` § Stripe |
| "Wise Business", "Airwallex US", "multi-currency" | `references/banking-payment-infrastructure.md` § Wise + Airwallex |
| "Chase business banking", "traditional bank rejection" | `references/banking-payment-infrastructure.md` § Traditional banks |
| "Bank account opening sequence", "what order to set up banking" | `references/banking-payment-infrastructure.md` § Recommended sequence |

## TL;DR — recommended setup

For a foreign-owned Delaware C-Corp like PlayableLabs Inc., **Mercury + Stripe + (optionally) Wise**:

| # | Service | Purpose | Cost | Setup time |
|---|---|---|---|---|
| 1 | **Mercury** | Primary USD business checking account | Free | 1–4 weeks after EIN |
| 2 | **Stripe** | Payment processor for online billing/invoicing | 2.9% + 30¢ per card | 2–4 weeks KYB review |
| 3 | **Wise Business** (optional) | Multi-currency, cheap FX for invoicing in EUR/GBP/JPY | $0 base + per-transfer fee | 1–2 weeks |
| 4 | **Airwallex** (optional) | If already on Airwallex for HK entity; keeps infrastructure consistent | Variable | 1–2 weeks |

**Do NOT bother with:** Chase, BofA, Wells Fargo (require in-person + US address); Brex (foreign-founder support has loosened but still flaky).

## Mercury — the workhorse

Mercury is the de-facto choice for foreign-owned Delaware C-Corps. Online application; no US presence required (though they've added a "establish US physical presence within 6 months" guideline in 2024).

**Required documents:**
- EIN confirmation letter (Form CP 575)
- Certificate of Incorporation (filed with DE)
- Passport scans for **every UBO with ≥25% ownership** (so all 5 PlayableLabs shareholders required since Bach owns >25% and the others are listed even if smaller)
- Utility bill or proof of residential address (per UBO)
- Business description + website
- Photo of CEO

**Common rejection reasons:**
1. Vague business description ("consulting" without specifics)
2. No website or pitch deck
3. UBOs without verifiable residential addresses
4. Industry on Mercury's restricted list (crypto, gambling, adult, MLM)

## Stripe activation gotchas

Stripe's KYB process can take 2–4 weeks for foreign-owned Delaware corps. Most common holdups:
- Missing W-8BEN-E for the entity itself (Stripe needs this even though entity is US — confusing)
- Business model description that triggers risk flags (playable ads is fine; adtech generally is fine; affiliate marketing is borderline)
- Bank account verification — Mercury account must be 30+ days old for Stripe to accept it as the payout destination

## Recommended action sequence

```
Week 1 (post-incorporation):
  → EIN via SS-4 phone line

Week 2-3:
  → Apply to Mercury (use EIN, Cert of Inc, passport scans)
  → Mercury reviews (1-4 weeks)

Week 3-4 (parallel):
  → Apply to Stripe with Mercury-pending account as future payout destination
  → Submit W-8BEN-E + business description to Stripe

Week 4-6:
  → Mercury approved → fund initial deposit
  → Stripe KYB review continues

Week 6-8:
  → Stripe approved → connect to Mercury for payouts
  → (Optional) apply to Wise Business for FX

Week 8+:
  → All systems operational
```

## Banking across the 3 entities

PlayableLabs Inc. (DE) needs USD banking primarily for US-based SaaS billing. HK and ByteonLab keep their own banking:

| Entity | Primary bank | Currency | Use |
|---|---|---|---|
| **PlayableLabs Inc.** (DE) | Mercury | USD | US customer billing, US contractor payments, Stripe payouts |
| **The One Game Studio Ltd.** (HK) | Airwallex + Payoneer | USD + HKD | Game royalties, BagelCode funding, JM Game distribution |
| **ByteonLab** (VN) | Vietnamese local bank | VND | Vietnam payroll, local vendor payments |

Inter-entity transfers require intercompany invoicing + arm's-length pricing (see `t1k-foreign-owned-tax` skill on transfer pricing).

## Companion skills

- **`t1k-delaware-incorporation`** — EIN comes after incorporation
- **`t1k-foreign-owned-tax`** — EIN application via SS-4 (no online for foreign founders)
- **`t1k-hk-corp`** — HK Airwallex / Payoneer banking on the sister entity side

## See also

- Full research: `references/banking-payment-infrastructure.md`
- Citations: `references/citations.md`
- Mercury foreign founders guide: https://mercury.com/help (search "foreign founders")
- Stripe Atlas guide: https://stripe.com/atlas/guides
