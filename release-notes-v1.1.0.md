# Release Notes for v1.1.0

## 🎯 Outcome Pack Release

This release introduces **Outcome Templates** - pre-configured business workflow scaffolding that gets you from zero to production in 90 seconds.

### ✨ Highlights

- **`quallaa outcome`** - Create projects from business workflow templates
- **`quallaa evaluators run`** - Measure what matters with HTML scorecards
- **`quallaa doctor --audit-secrets`** - Security auditing and health checks
- **`quallaa init --minimal`** - Headless worker variant for batch processing

### 📦 Outcome Templates

#### Order-to-Cash Reconciliation
```bash
quallaa outcome --template order-cash-reco
```
Complete reconciliation system with Shopify, Stripe, and QuickBooks connectors.

#### Lead Lifecycle Management
```bash
quallaa outcome --template lead-lifecycle-core
```
Lead management with deduplication, enrichment, routing, and SLA tracking.

### 📊 Evaluation Metrics

Every outcome template now includes evaluators that measure:
- **Accuracy**: How often do we get the right answer? (target: ≥90%)
- **Rework Ratio**: How often does someone intervene? (target: ≤5%)
- **Processing Time**: How fast per item? (target: ≤5s)
- **Unit Cost**: What does each operation cost? (target: ≤$0.10)

### 🏗️ Architecture Choices

Choose between two deployment patterns:
- **Web + Jobs**: Full Next.js app with background processing (Vercel)
- **Headless Worker**: Minimal Node.js workers for batch jobs (Fly.io/Railway)

### 📝 Full Changelog

See [CHANGELOG.md](https://github.com/jefftoffoli/quallaa-cli/blob/main/CHANGELOG.md) for complete details.

### 🚀 Installation

```bash
npm install -g quallaa-cli@latest
```

Or use npx (always latest):
```bash
npx quallaa-cli@latest outcome --template order-cash-reco
```

---

## To Create GitHub Release

Run this command after authenticating with `gh auth login`:

```bash
gh release create v1.1.0 \
  --title "v1.1.0 - Outcome Pack Templates" \
  --notes-file release-notes-v1.1.0.md
```

Or create manually at: https://github.com/jefftoffoli/quallaa-cli/releases/new