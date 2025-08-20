Got it — let’s dig into the **Donor & Member Rollups Pack (DMRP)**. This one squarely targets **nonprofits, associations, and member-based orgs** that need reliable financial + engagement reporting across fragmented systems.

---

# 🧩 Donor & Member Rollups Pack (DMRP)

## 1) Problem it Solves

**The pain point in nonprofit finance + ops:**

* **Donations** flow through Stripe, PayPal, or bespoke gateways.
* **Memberships** are managed in AMS/CRM systems (Wild Apricot, NeonCRM, Salesforce NPSP, HubSpot).
* **Accounting** sits in QuickBooks or Sage Intacct.

💥 Finance + development teams struggle to roll up:

* Who gave what, and when (donations)?
* Who is active, lapsed, or pending (memberships)?
* Which funds/programs those flows belong to?

**Consequences:**

* **Bad board reports** (numbers don’t reconcile).
* **Compliance risk** (restricted funds misallocated).
* **Frustrated staff** doing monthly spreadsheet rollups.
* **Poor stewardship** (can’t target lapsed donors/members).

---

## 2) Systems & Interfaces

* **Donation processors**: Stripe, PayPal, Classy.
* **AMS/CRM**: NeonCRM, Salesforce NPSP, HubSpot.
* **Accounting**: QuickBooks Online, Sage Intacct.

---

## 3) Pack Scope

**Goal:** Provide a **single, reconciled rollup** of donor and member activity for finance + fundraising.

**Steps:**

1. **Ingest**

   * Donations (donor, amount, fund, date).
   * Membership records (member ID, status, start/end, dues).
   * Accounting entries (journal, fund, revenue class).
2. **Normalize**

   * Standard donor/member IDs across systems.
   * Map restricted vs unrestricted funds.
3. **Rollup**

   * Donations by donor, by fund, by period.
   * Membership counts by status (active, lapsed, pending).
   * Reconciliation against accounting revenue.
4. **Exceptions**

   * Donations missing in accounting.
   * Members active in CRM but unpaid in accounting.
   * Funds misclassified.
5. **Report**

   * Donor Rollup (CSV, JSON).
   * Membership Rollup (CSV, JSON).
   * Exceptions ledger.
   * Evaluator scorecard (coverage %, reconciliation rate, leakage).

**Outputs:**

* `/reports/donor-rollup.csv`
* `/reports/member-rollup.csv`
* `/reports/exceptions.csv`
* `/reports/scorecard.html`

---

## 4) CLI Scaffold (target)

```bash
# Scaffold the Pack
quallaa init outcome donor-member-rollups \
  --crm neoncrm \
  --donations stripe \
  --accounting qbo

# Run reconciliation + rollup
npm run dmrp:rollup

# Generate evaluator scorecard
quallaa evaluators run --report html
```

---

## 5) Repo Structure

```
/contracts
  Donation.json
  Member.json
  Fund.json
  JournalEntry.json

/integrations
  stripe.ts
  neoncrm.ts
  qbo.ts

/jobs
  ingest.ts
  rollup.ts
  reconcile.ts
  nightly-cron.ts

/evaluators
  gold-donations.csv
  gold-members.csv
  expected-rollups.csv
  evaluator.test.ts

/reports
  donor-rollup.csv
  member-rollup.csv
  exceptions.csv
  scorecard.html

/app (optional)
  /exceptions   # Next.js review table
```

---

## 6) Data Contracts (schemas)

### `Donation.json`

```json
{
  "type": "object",
  "required": ["donorId", "amount", "fund", "date"],
  "properties": {
    "donorId": {"type":"string"},
    "amount": {"type":"number"},
    "fund": {"type":"string"},
    "date": {"type":"string", "format":"date"},
    "source": {"enum":["stripe","paypal","classy"]}
  }
}
```

### `Member.json`

```json
{
  "type": "object",
  "required": ["memberId", "status", "startDate", "endDate"],
  "properties": {
    "memberId": {"type":"string"},
    "status": {"enum":["active","lapsed","pending"]},
    "startDate": {"type":"string","format":"date"},
    "endDate": {"type":"string","format":"date"},
    "duesAmount": {"type":"number"}
  }
}
```

---

## 7) Evaluator Metrics

* **Reconciliation Rate**: % of donations reconciled with accounting.
* **Coverage %**: % of members with dues matched to payments.
* **Exception Rate**: mismatches ÷ total records.
* **Leakage \$**: donations or dues missing from accounting.

**Scorecard example:**

* Donations reconciled: 96.8%
* Membership coverage: 92.1%
* Exceptions: 44
* Leakage prevented: \$12,340

---

## 8) Exception Handling

**CSV format:**

```
donor_id, donation_id, qbo_entry_id, discrepancy, expected, actual, status
D-450, DON-789, JE-128, Missing_QBO, 250.00, null, open
M-330, null, JE-140, Active_Member_No_Dues, 120.00, 0, open
```

**Optional UI:**

* Tabs for Donor exceptions, Member exceptions.
* Filters: Missing, Misclassified, Unpaid.
* Export: CSV/PDF for board or auditor.

---

## 9) ICP Fit

* **Nonprofits** with >1k donors/year.
* **Associations & Membership Orgs** with dues-based models.
* **Finance Directors + Development Officers** juggling spreadsheets.

**Trigger events:**

* Annual audit prep.
* Board demanding reliable donor/member reporting.
* Migration to new CRM/AMS.
* Growth → 10k+ members/donors (manual rollups break).

---

## 10) Sales Messaging

* “Stop reconciling donations and memberships in spreadsheets.”
* “Board-ready donor & member reports in one click.”
* “Catch missing revenue before the auditors do.”
* **CTA:** *Spin up the Donor & Member Rollups Pack with Quallaa CLI.*

---

## 11) Demo Dataset (ship with Pack)

* `gold-donations.csv` → 500 sample donations (Stripe + PayPal).
* `gold-members.csv` → 200 members, with lapsed + pending cases.
* `expected-rollups.csv` → reconciled truth dataset.

---

## 12) Roadmap to MVP

* Add `quallaa init outcome donor-member-rollups`.
* Build Stripe + NeonCRM + QBO connectors first.
* Bake in evaluator harness & demo dataset.
* Ship `/reports/scorecard.html`.
* Optional: Next.js exceptions UI → “Board Report Ready.”

---

✅ This Pack proves Quallaa’s value in the **nonprofit / association vertical**. It delivers *direct board-level outcomes* (clean donor/member rollups) instead of raw integrations — which is exactly the differentiation from iPaaS tools like Zapier.

---

Would you like me to **mock up a sample `/reports/donor-rollup.csv` and `/reports/member-rollup.csv`** (with realistic fake data) so you can demo the Pack even before the connectors are live?
