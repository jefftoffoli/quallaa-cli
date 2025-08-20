Awesome—here’s a deep, build-ready spec for the **Lead-Lifecycle Core Pack (LLCP)**. It’s designed to drop straight into your CLI as an Outcome Pack and to sell well on your site.

---

# 🧩 Lead-Lifecycle Core Pack (LLCP)

## 1) Problem it solves (RevOps in one breath)

* **Messy inbound**: forms, imports, partner CSVs, webinar lists, LinkedIn leads → duplicates, missing fields, bad UTMs.
* **Slow routing**: leads stall in “New” and miss SLA windows.
* **Contact bloat**: HubSpot/SFDC contact counts (and costs) climb with junk and dupes.
* **Inconsistent reporting**: source/medium/campaign differ by tool; MQL/SQL conversions aren’t trustworthy.

**Goal:** Clean, dedupe, enrich, route, and track **SLA-compliant** responses—using **APIs**, not GUIs.

---

## 2) Systems & Interfaces (baseline)

* **CRM**: HubSpot *or* Salesforce (start with one; abstract client).
* **Analytics**: GA4 (UTM/session attribution), optional ad platform hooks.
* **Messaging**: your email/SMS provider (e.g., Resend/Sendgrid/Twilio)—optional for SLA nudges.
* **Storage**: Postgres (Neon/Supabase) for staging tables + evaluator artifacts.

---

## 3) Pack Scope (what’s in v1)

**Pipelines (nightly + real-time hooks):**

1. **Normalize** inbound leads (schema/UTM/phone/email standardization).
2. **Deduplicate** contacts & accounts (scored matching with thresholds).
3. **Enrich** (light, local where possible; external enrichment is a pluggable step).
4. **Route** (round-robin, territory, tier, named reps; create tasks/owner in CRM).
5. **SLA timers** (create clocks; escalate if no reply within X min/hours).
6. **Audit & Report** (log transformations, output a daily scorecard).

**Outputs:**

* **Clean Contact/Account** records upserted to CRM.
* **Owner/Queue assignment** + **follow-up task** in CRM.
* **SLA audit**: first-touch time, breach flags, escalation logs.
* **Evaluator scorecard**: accuracy, duplicates removed, routing latency, cost deltas.

---

## 4) CLI experience (target)

```bash
# Scaffold a new LLCP repo
quallaa init outcome lead-lifecycle-core \
  --crm hubspot \
  --analytics ga4 \
  --demo

# Run the pipeline locally
npm run llcp:ingest && npm run llcp:route

# Generate an HTML scorecard from gold data
quallaa evaluators run --report html
```

---

## 5) Repo structure

```
/contracts
  Contact.json
  Account.json
  UTM.json
  RoutingRule.json
  SLAPolicy.json

/integrations
  hubspot.ts           # or salesforce.ts (choose at init)
  ga4.ts
  email.ts             # optional for SLA nudges

/jobs
  ingest.ts            # pull + stage
  normalize.ts         # standardize fields/UTMs
  dedupe.ts            # scored matching
  enrich.ts            # pluggable enrichment stub
  route.ts             # assignment + task creation
  sla.ts               # timers & escalations
  nightly-cron.ts      # schedule orchestration

/lib
  matching.ts          # similarity funcs + scoring model
  utm.ts               # UTM normalization
  rules.ts             # routing logic engine
  kpi.ts               # metrics calc

/evaluators
  gold-contacts.csv
  gold-accounts.csv
  expected-routing.csv
  evaluator.test.ts    # computes precision/recall etc.

/reports
  llcp-summary.json
  llcp-scorecard.html
  duplicates.csv
  sla-breaches.csv

/app (optional)
  /exceptions          # minimal Next.js table for review

CLAUDE.md
```

---

## 6) Data contracts (schemas – trimmed for clarity)

### `Contact.json` (key fields)

```json
{
  "type": "object",
  "required": ["email","firstName","lastName","source","consent"],
  "properties": {
    "email": {"type":"string","format":"email"},
    "firstName": {"type":"string"},
    "lastName": {"type":"string"},
    "phone": {"type":"string"},
    "company": {"type":"string"},
    "jobTitle": {"type":"string"},
    "source": {"type":"string"},            // normalized (utm_source or system)
    "utm": {"$ref":"#/definitions/UTM"},
    "countries": {"type":"array","items":{"type":"string"}},
    "consent": {"type":"object","properties":{
      "email":{"type":"boolean"},"sms":{"type":"boolean"},"timestamp":{"type":"string","format":"date-time"}
    }},
    "notes":{"type":"string"}
  },
  "definitions": {
    "UTM": {
      "type":"object",
      "properties":{
        "source":{"type":"string"},
        "medium":{"type":"string"},
        "campaign":{"type":"string"},
        "term":{"type":"string"},
        "content":{"type":"string"}
      }
    }
  }
}
```

### `RoutingRule.json` (example)

```json
{
  "type":"object",
  "properties": {
    "strategy":{"enum":["round_robin","territory","tiered"]},
    "territories":{"type":"array","items":{
      "type":"object",
      "properties":{"region":{"type":"string"},"owners":{"type":"array","items":{"type":"string"}}}
    }},
    "tierRules":{"type":"array","items":{
      "type":"object","properties":{"predicate":{"type":"string"},"owner":{"type":"string"}}
    }},
    "fallbackOwner":{"type":"string"}
  },
  "required":["strategy","fallbackOwner"]
}
```

### `SLAPolicy.json`

```json
{
  "type":"object",
  "properties": {
    "firstResponseMinutes":{"type":"integer","minimum":1},
    "workingHours":{"type":"object","properties":{"tz":{"type":"string"}, "start":{"type":"string"}, "end":{"type":"string"}, "days":{"type":"array","items":{"type":"integer"}}}},
    "escalations":{"type":"array","items":{"type":"object","properties":{
      "afterMinutes":{"type":"integer"}, "to":{"type":"string"}, "via":{"enum":["email","task","slack","sms"]}
    }}} 
  },
  "required":["firstResponseMinutes"]
}
```

---

## 7) Core algorithms

### A) **UTM normalization**

* Lowercase, trim, map common aliases → `utm_source`.
* Strip garbage strings (`na`, `(not set)`, `unknown` → null).
* Canonicalize `utm_medium` to a fixed set: `paid`, `organic`, `referral`, `email`, `social`, `events`, `direct`.
* If GA4 session parameters available, prefer those over raw form fields.

### B) **Dedupe (Contact)**

* **Keys**: email (exact), phone (E.164), name+company fuzzy.
* **Blocking**: group by email domain OR normalized phone to reduce comparisons.
* **Scoring model** (0–100):

  * +70 if email exact match
  * +40 if phone exact
  * +25 if Jaro-Winkler(name) ≥ .92 AND company cosine ≥ .9
  * −20 if timestamp gap > 18 months and prior status = “Disqualified”
* **Thresholds**:

  * `≥70` → auto-merge
  * `50–69` → review (write to `/reports/duplicates.csv`)
  * `<50` → new record
* **Merge policy**: prefer newest non-empty values; preserve earliest create date; union consent signals (true wins); maintain `merged_from` audit trail.

### C) **Account matching**

* Normalize company names (strip LLC/Inc, punctuation).
* Domain match (from email): strongest signal.
* Fallback: exact on normalized name + country/state.

### D) **Routing**

* Choose strategy:

  * **round\_robin** within team/queue.
  * **territory** (by country/region/state).
  * **tiered**: if `(company_size>200)` or `(title in ['VP','C-level'])` → Enterprise owner; else SMB queue.
* Create **CRM owner assignment** + **Follow-Up Task** (due within SLA window).
* Write a local **routing\_log** (contact\_id, owner, reason, timestamp).

### E) **SLA timers**

* For each routed lead:

  * compute **due\_at** per `SLAPolicy` (work hours aware).
  * **Watchers** job checks for first-touch (email/reply/call/task-complete).
  * If breach: escalate (email/task/Slack) as configured.

---

## 8) Evaluators (proof baked in)

**Metrics**

* **Dedup Precision/Recall** (vs. gold clustering in `/evaluators/gold-contacts.csv`)
* **Routing Latency** (median p50/p90 minutes to owner assignment)
* **SLA Adherence** (% first-touch within SLA window)
* **Contact Cost Delta** (estimated: duplicates removed × platform cost/1k contacts)
* **Downstream Lift** (optional): MQL→SQL conversion delta on clean vs. dirty cohorts

**Artifacts**

* `/reports/llcp-scorecard.html` (sparkline KPIs + tables)
* `/reports/duplicates.csv` (review queue)
* `/reports/sla-breaches.csv` (who/when/why)

**Example scoring snippet (conceptual)**

* Dedup F1 ≥ **0.85** (target)
* Routing p50 latency **< 2 min** (webhook path), **< 30 min** (batch)
* SLA adherence **> 90%** for `firstResponseMinutes = 60`

---

## 9) Exceptions & review

**Duplicates review CSV**

```
group_id, confidence, primary_contact, candidate_contact, reason
A12, 0.64, jane@acme.com, j.smith@acme.com, name+company fuzzy
```

**UI (optional)**: minimal Next.js table to accept/reject merges; writes decisions back to DB and CRM.

---

## 10) Security & compliance guardrails

* **Consent-first**: never auto-opt-in; merge consent as OR (true wins).
* **PII minimization**: only store what’s needed for matching/routing.
* **Audit logs**: all merges and owner changes recorded with before/after diffs.
* **Secrets**: least-privilege tokens; read-only where possible for analytics; write scope only for owner/tasks.

---

## 11) Website one-pager content (LLCP)

**Hero:**
“**Lead-Lifecycle Core** — Clean, dedupe, and route leads with SLA precision.”

**Pain → Solution:**

* “Stop paying for duplicate contacts. Respond on time, every time.”
* “API-first pipeline: normalize → dedupe → enrich → route → SLA.”

**KPIs (with evaluator badges):**

* Dedup F1 ≥ 0.85
* Routing p50 < 2 minutes
* SLA > 90%

**CLI CTA:**

```bash
npm i -g @quallaa/cli
quallaa init outcome lead-lifecycle-core --crm hubspot --analytics ga4 --demo
quallaa evaluators run --report html
```

**FAQ:** “Can this run on Salesforce?” → Yes (choose `--crm salesforce`). “How do you handle consent?” → union + audit.

---

## 12) Demo dataset (ship with Pack)

* **`gold-contacts.csv`**: 1,000 rows including 150 duplicate clusters, noisy UTMs, mixed phone formats.
* **`expected-routing.csv`**: territory + tier outcomes for a sample day.
* **`sla-events.jsonl`**: simulated reply/task events for adherence scoring.

---

## 13) Roadmap to MVP (for CLI)

* Add generator: `quallaa init outcome lead-lifecycle-core`.
* Implement **HubSpot** first, **Salesforce** behind a flag.
* Ship **evaluators** with gold data + HTML report.
* Minimal **exceptions UI** for duplicates review (optional but persuasive in sales).

---

## 14) Success checklist (what “ready” looks like)

* ✅ End-to-end dry run succeeds with demo data.
* ✅ Scorecard renders KPIs with green thresholds.
* ✅ CRM shows owner + follow-up tasks within SLA.
* ✅ `/reports/duplicates.csv` opens with sensible candidates.

---

If you want, I can draft:

* the **matching.ts** scoring function (Jaro-Winkler, cosine, thresholding),
* the **UTM normalization** helper,
* and a **HubSpot adapter** stub (create/update contact, associate company, assign owner, create task)
  so your team can paste them directly into the scaffold.
