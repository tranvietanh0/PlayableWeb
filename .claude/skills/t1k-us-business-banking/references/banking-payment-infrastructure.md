---
origin: theonekit-core
repository: The1Studio/theonekit-core
module: t1k-legal
protected: true
---

## Section 3: Banking & Payment Infrastructure

### 3.1 Why Banking Is Hard for Foreign-Owned Entities

US banks (Chase, BofA, Wells Fargo, Citibank) have shifted to **ultra-conservative KYC/AML (Know Your Customer / Anti-Money Laundering) policies** on foreign-owned entities since FATCA (2010) and FinCEN rules (2021). Reasons:

- **Beneficial Ownership Registry pressure:** Banks must identify all UBOs (>25% owners) via passports and proof of address.
- **OFAC compliance:** Ensure no shareholder is on US sanctions lists.
- **AML & transaction monitoring:** Ensure funds are not from illegal sources (drug trafficking, terrorism, sanctions evasion).
- **Form W-9 / W-8BEN confusion:** Foreign-owned entities don't fit traditional bank form workflows.

**Result:** Many large US banks now **decline to open accounts for foreign-owned corporations**, even if they meet regulatory requirements. Fintechs (Mercury, Brex, Wise) are far more foreign-founder-friendly.

### 3.2 Mercury Bank (Recommended)

[Mercury](https://mercury.com/) is a fintech focused on startups, explicitly supporting foreign-founded US corporations.

#### Eligibility & Application

| Requirement | Status for PlayableLabs | Notes |
|-------------|------------------------|-------|
| **US incorporation** | ✓ Delaware C-Corp | Required |
| **EIN** | Obtained during application | Form SS-4 + EIN needed before application |
| **Foreign ownership** | ✓ All shareholders non-US | Mercury supports this explicitly |
| **>25% UBO documentation** | ✓ Passports + address | See below |

#### KYC Documentation Required

Mercury requires [all beneficial owners (>25%)](https://support.mercury.com/hc/en-us/articles/28770957425172-Gathering-your-documents) to provide:

1. **Government-issued ID (primary applicant):**
   - Passport (color scan, front + back)
   - Issue & expiration dates must be visible

2. **Beneficial Owner IDs (if >25% ownership):**
   - Hoang Anh Tu: Passport (47.1%)
   - Phan Trong Bach: Passport (32.2%)
   - All others <25%: typically not required, but Mercury may ask for additional info

3. **Proof of Address (for foreign residents):**
   - Utility bill (electricity, water, internet) issued in the last 3 months
   - Bank statement
   - Insurance policy
   - Lease or mortgage statement
   - Must show individual's name + current address

4. **Company Documentation:**
   - Certificate of Incorporation
   - EIN Letter (IRS Form SS-4-R)
   - Completed Form W-9 (or Mercury-branded equivalent)

5. **Business Details:**
   - Description of business (e.g., "SaaS platform for playable ads and publisher monetization")
   - Website URL (if available; not mandatory at signup)
   - Expected monthly transaction volume / average balance

#### Application Process & Timeline

1. **Start online application:** Visit [Mercury.com](https://mercury.com/) → "Open an account"
2. **Fill company info:** Name (PlayableLabs Inc.), EIN, business address
3. **Upload documents:** Passports, certificates, proof of address (high-resolution PDFs or images)
4. **Review (1–3 days):** Mercury compliance team reviews KYC submissions
5. **Approval (1–2 weeks):** If all documents clear, Mercury confirms account approval via email
6. **Bank account setup (1–2 days after approval):** Receive routing number + account number; can start transfers immediately

**Total timeline:** 1–4 weeks from application to first transaction.

#### Features & Costs

| Feature | Mercury | Notes |
|---------|---------|-------|
| **Monthly fee** | $0 | Free business checking |
| **Account minimum** | $0 | No balance minimum |
| **Transactions** | ACH transfers, wire transfers, check deposits, bill pay | All standard; no limits |
| **API access** | Yes | Developers can integrate payments |
| **Debit card** | Yes | Up to 10 issued per account |
| **Multi-currency** | No | USD only (use Wise/Airwallex for FX) |
| **Compliance requirement (2024 update)** | Establish US operations within 6 months | Must have a US physical presence (office, employee, or contractor) |

**Critical Note:** Mercury now requires that foreign-owned entities establish "some form of US operations" within 6 months of account opening (e.g., hire a US contractor, establish a registered office, open a Stripe account serving US customers). This is a recent update and reflects FinCEN pressure. **PlayableLabs should plan to have a US-based contractor or employee within 6 months.**

### 3.3 Stripe (Payment Processing)

[Stripe](https://stripe.com/) is the payment processor / acquirer for online payments. PlayableLabs will need Stripe to collect payments from customers.

#### Stripe Business Account Activation

**Requirement:** US Business Bank Account (Mercury) + EIN.

| Step | Timeline | Documents |
|------|----------|-----------|
| 1. Create Stripe Dashboard account | Immediate | Email + password |
| 2. Add business info | Day 0–1 | Company name, EIN, address, business description |
| 3. Connect bank account | Day 1 | Mercury routing # + account # |
| 4. Add UBO (>25% shareholder) info | Day 0–2 | Hoang Anh Tu + Phan Trong Bach: full name, DOB, address, ID # (passport) |
| 5. KYB (Know Your Business) verification | 2–4 weeks | Stripe verifies ownership, business legitimacy via identity verification + business registration check |
| 6. Card processing activation | Day 1 (after KYB) | Stripe enables credit card, ACH, Apple Pay, etc. |

**Stripe fees:**
- 2.9% + 30¢ per transaction (credit cards)
- 0.8% + 30¢ (ACH transfers)
- Varies for international cards (3.9% + 30¢)

**Stripe documentation:**
- [Identity Verification Requirements](https://docs.stripe.com/connect/identity-verification)
- [Required Verification Information](https://docs.stripe.com/connect/required-verification-information)

### 3.4 Wise Business (Multi-Currency)

[Wise (formerly TransferWise)](https://wise.com/business/) is a fintech for multi-currency transfers and business accounts. Not a primary banking solution but valuable for FX / international transfers.

#### Use Case for PlayableLabs

- **Customer payments in multiple currencies:** If PlayableLabs serves customers in EU (EUR), Asia (SGD, JPY), UK (GBP), Wise offers real-time FX at mid-market rates.
- **Payments to Vietnam:** If paying ByteonLab VN or HK contractors in VND/HKD, Wise transfers are cheaper than Mercury ACH or Stripe.

#### Business Account Setup

- **Documents:** Same as Mercury (passports, address proof).
- **Setup time:** 1–2 weeks.
- **Costs:** Transparent FX fees (typically 0.4–1% spread vs. 2–3% at banks); free bank account, paid transfers.

**Recommendation:** Open Wise Business account **after Mercury**, specifically for multi-currency operations. Not critical for MVP but useful once international customers are acquired.

### 3.5 Airwallex (Complementary to Wise)

[Airwallex](https://www.airwallex.com/en-US/en-us) is another fintech for global payments, already used by The One Game Studio HK. Provides:

- Multi-currency accounts (USD, HKD, SGD, VND, etc.)
- Virtual card issuance
- Automated invoicing + payment collection
- API for embedded payments

**PlayableLabs consideration:** If you want to centralize payments across HK + US entities, Airwallex offers a unified platform. However, **Stripe is more critical for SaaS/payment-widget use cases**, so prioritize Stripe first.

### 3.6 Banking Checklist & Order of Operations

| # | Service | Status | Timeline |
|---|---------|--------|----------|
| 1 | **EIN (Form SS-4)** | Obtain first | Week 2–3 post-incorporation |
| 2 | **Mercury Bank** | Primary US bank | Week 3–6 (2-4 weeks after EIN) |
| 3 | **Stripe** | Payment processor | Week 4–8 (after Mercury account active) |
| 4 | **Wise Business** (optional) | FX transfers | Week 6–10 (after Stripe active, if international revenue expected) |
| 5 | **Airwallex** (optional) | Unified multicurrency | Week 8–12 (if managing HK+US expenses together) |

### 3.7 Common Rejection Reasons & Mitigations

| Rejection Reason | Why It Happens | Mitigation |
|------------------|----------------|-----------|
| **Non-resident addresses** | Banks flag all foreign addresses as high-risk. | Provide utility bills (email statements don't count). |
| **Unclear business model** | "Playable ads" or "SaaS" alone is vague. | Write clear business description: "B2B SaaS platform connecting game publishers with advertisers for playable ad campaigns." |
| **No website / deck** | Makes business look illegitimate. | Create simple website (even landing page). Deck optional but helpful. |
| **Mismatch in UBO info** | Passport name ≠ bank form name (e.g., nickname vs. legal name). | Use legal name (as on passport) consistently across all documents. |
| **High-risk country** | Vietnam, despite stable government, may trigger additional scrutiny. | Provide extra documentation (business license from Vietnam, articles from press, customer references). |
| **No US physical presence** | Mercury now requires US ops within 6 months. | Plan to hire a US contractor or open a physical office before the 6-month deadline. |

### 3.8 Costs Summary — Banking & Payments

| Service | Setup | Monthly | Annual | Notes |
|---------|-------|---------|--------|-------|
| **Mercury Bank** | $0 | $0 | $0 | Free; fast KYC for foreign owners |
| **Stripe** | $0 | $0 (% per transaction) | 2.9% + 30¢ per card | Charges only on revenue |
| **Wise Business** | $0 | $0 (free account) | ~$5–20/transfer | Transparent FX; pay per transfer |
| **Airwallex** (optional) | $0 | $0 | ~$1K–2K/year if heavy use | Card issuance, automation; pricier for light use |
| **Registered business address (Firstbase Mailroom, optional)** | $35 registration | $35 | $420 | If Mercury address not public-facing |
| **TOTAL Year 1 (Mercury + Stripe)** | **$0** | **$0 base** | **% of revenue** | Plus payment fees |

### Action Items — Banking (30 / 90 / 180 days)

**30 days:**
- Have EIN in hand (Form SS-4 complete).
- Prepare Mercury KYC documents: passports (Tu, Bach) + proof of address (all).
- Draft business description for Stripe: "B2B SaaS connecting mobile game publishers to playable ad networks; monetization platform."

**90 days:**
- Mercury bank account fully operational.
- Stripe account activated + test transactions.
- Wise Business account (optional) set up if FX transfers are planned.

**180 days:**
- Ensure US physical presence established (contractor hired or office rented) per Mercury's 6-month requirement.

---

