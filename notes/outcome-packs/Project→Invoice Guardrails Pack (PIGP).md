Perfect — let’s deep dive the **Project→Invoice Guardrails Pack (PIGP)**. This one is highly attractive for **professional services, consultancies, agencies, and SIs** that live and die by accurate billing and revenue recognition.

---

# 🧩 Project→Invoice Guardrails Pack (PIGP)

## 1) Problem it Solves

**Pain points in services organizations:**

* **Time entry drift:** consultants log hours late, inconsistently, or against the wrong projects.
* **SOW mismatch:** invoices don’t line up with contracted scope (under-billing, over-billing).
* **RevRec issues:** manual spreadsheets for % complete vs. milestone billing → errors that auditors flag.
* **Slow closes:** Controllers spend days reconciling WIP vs. invoices.

**Consequences:**

* **Revenue leakage** (10–30% common in project shops).
* **Client disputes** (“why did you bill this?”).
* **Audit risk** (ASC 606 / IFRS 15 compliance issues).

---

## 2) Systems & Interfaces

* **ERP/Accounting**: NetSuite, QuickBooks Online, Xero (start with QBO + NetSuite).
* **Time Tracking**: Harvest, Toggl, ClickUp, Jira, Asana (all have APIs).
* **Contracts/SOWs**: stored as structured objects (JSON/CSV) or imported from ERP.

---

## 3) Pack Scope

**Goal:** Automate reconciliation between **time entries, projects, contracts, and invoices**; produce guardrails & exception reports.

**Steps:**

1. **Ingest**

   * Pull time entries (date, project, user, hours, rate).
   * Pull project metadata (budget, contract type, SOW caps).
   * Pull invoice drafts (line items, amounts, status).
2. **Normalize**

   * Standardize project IDs across systems.
   * Map SOWs to projects.
3. **Reconcile**

   * WIP (hours × rate) vs. billed amounts.
   * Check against contract caps (fixed fee, T\&M, milestone).
   * Flag discrepancies: under-billed, over-billed, unbilled time, misallocated hours.
4. **RevRec checks**

   * % complete vs. milestone rules.
   * Compare recognized vs. deferred amounts.
5. **Report**

   * Exceptions ledger (CSV/UI).
   * Guardrail summary (totals matched vs. off).
   * Evaluator scorecard (billing accuracy %, exception rate, DSO impact).

**Outputs:**

* `/reports/guardrails.csv` (discrepancies)
* `/reports/summary.json` (aggregates)
* `/reports/scorecard.html` (KPIs)

---

## 4) CLI Scaffold (target)

```bash
# Scaffold the Pack
quallaa init outcome project-invoice-guardrails \
  --erp netsuite \
  --timetracking harvest \
  --demo

# Run reconciliation
npm run pigp:reconcile

# Generate evaluator scorecard
quallaa evaluators run --report html
```

---

## 5) Repo Structure

```
/contracts
  TimeEntry.json
  Project.json
  SOW.json
  Invoice.json
  RevRecPolicy.json

/integrations
  netsuite.ts
  harvest.ts
  qbo.ts

/jobs
  ingest.ts
  reconcile.ts
  revrec.ts
  nightly-cron.ts

/evaluators
  gold-time.csv
  gold-invoices.csv
  expected-exceptions.csv
  evaluator.test.ts

/reports
  guardrails.csv
  summary.json
  scorecard.html

/app (optional)
  /exceptions   # Next.js review table

CLAUDE.md
```

---

## 6) Data Contracts (schemas)

### `TimeEntry.json`

```json
{
  "type": "object",
  "required": ["employeeId", "projectId", "date", "hours"],
  "properties": {
    "employeeId": {"type": "string"},
    "projectId": {"type": "string"},
    "date": {"type": "string", "format": "date"},
    "hours": {"type": "number"},
    "rate": {"type": "number"},
    "task": {"type": "string"},
    "notes": {"type": "string"}
  }
}
```

### `SOW.json`

```json
{
  "type": "object",
  "required": ["projectId", "contractType", "budget"],
  "properties": {
    "projectId": {"type": "string"},
    "contractType": {"enum": ["fixed_fee", "time_materials", "milestone"]},
    "budget": {"type": "number"},
    "milestones": {"type":"array","items":{"type":"object","properties":{
      "name":{"type":"string"},"amount":{"type":"number"},"dueDate":{"type":"string","format":"date"}
    }}}
  }
}
```

### `Invoice.json`

```json
{
  "type": "object",
  "required": ["invoiceId", "projectId", "lineItems", "total"],
  "properties": {
    "invoiceId": {"type":"string"},
    "projectId": {"type":"string"},
    "lineItems":{"type":"array","items":{"type":"object","properties":{
      "description":{"type":"string"},
      "quantity":{"type":"number"},
      "unitPrice":{"type":"number"},
      "amount":{"type":"number"}
    }}},
    "total":{"type":"number"},
    "status":{"enum":["draft","sent","paid"]}
  }
}
```

---

## 7) Evaluator Metrics

* **Billing Accuracy %**: correctly matched hours/fees vs invoices.
* **Exception Rate**: discrepancies ÷ total records.
* **Revenue Leakage**: unbilled time × rate.
* **Overbilling Exposure**: billed > contract.
* **DSO Impact**: projected days sales outstanding reduction.

**Thresholds (v1 goals):**

* Billing accuracy ≥ 95%
* Exception rate ≤ 5%
* Revenue leakage ≤ 2% of total WIP

**Scorecard example (HTML):**

* Exceptions: 37
* Accuracy: 96.2%
* Revenue leakage prevented: \$18,450
* DSO reduction: 7 days

---

## 8) Exception Handling

**CSV example:**

```
project_id, time_entry_id, invoice_id, discrepancy, expected, actual, status
P-123, TE-889, INV-450, Under_Billed, 5000, 3500, open
P-124, TE-900, INV-452, Over_Billed, 4000, 5000, open
P-125, TE-901, null, Unbilled, 1200, 0, open
```

**Optional UI:**

* Next.js page: filters (Unbilled, Over, Under).
* Action: “Resolve” → mark closed, sync to ERP.

---

## 9) ICP Fit

* **Professional Services (consultancies, digital agencies, SIs)** using Harvest/NetSuite/QBO.
* **Finance/Controllers** struggling with revenue leakage + slow closes.
* **Trigger events:**

  * Moving to ASC 606 compliance.
  * Scaling past 20–30 billable staff.
  * M\&A or audit readiness.

---

## 10) Sales Messaging

* “Stop leaving money on the table: catch unbilled hours automatically.”
* “Never overbill a client again — guardrails enforce SOW rules.”
* “Audit-ready revenue recognition — in code, not spreadsheets.”
* **CTA:** *Spin up the Project→Invoice Guardrails Pack in 15 minutes with Quallaa CLI.*

---

## 11) Demo Dataset (ship with Pack)

* `gold-time.csv` → 1,000 entries with deliberate logging errors.
* `gold-invoices.csv` → invoice drafts, some mismatched.
* `expected-exceptions.csv` → ground truth for evaluator scoring.

---

## 12) Roadmap to MVP

* Add `quallaa init outcome project-invoice-guardrails`.
* Implement **Harvest + QBO** connectors first.
* Bake in evaluator harness & demo dataset.
* Ship `/reports/scorecard.html`.
* Add optional Next.js exceptions table.

---

✅ With this Pack, Quallaa proves its value for **revenue integrity**. It’s not a “nice-to-have”; it’s a **direct ROI + compliance** win for finance leaders.

---

Would you like me to **mock up the evaluator scoring script** (e.g., a TypeScript `evaluator.test.ts` that calculates billing accuracy %, exception rate, and leakage) so it’s ready to drop into the CLI scaffold?
