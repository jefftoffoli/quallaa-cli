import { OutcomeTemplateDefinition, StackVariant } from '../../types';

const webJobsVariant: StackVariant = {
  name: 'Web + Jobs',
  description: 'Full-stack application with web dashboard and background job processing',
  architecture: {
    framework: 'Next.js',
    database: 'PostgreSQL',
    queue: 'Bull/Redis',
    deployment: 'Vercel + Railway'
  },
  deployment: {
    frontend: 'vercel',
    database: 'railway',
    jobs: 'railway'
  },
  features: ['Web dashboard for exceptions review', 'Real-time reconciliation', 'Email alerts', 'Automated reporting']
};

const headlessWorkerVariant: StackVariant = {
  name: 'Headless Worker-Only',
  description: 'Backend-only solution with CLI tools and file-based reporting',
  architecture: {
    framework: 'Node.js',
    database: 'PostgreSQL',
    queue: 'Bull/Redis',
    deployment: 'Railway'
  },
  deployment: {
    database: 'railway',
    jobs: 'railway'
  },
  features: ['CLI-based reconciliation', 'File-based reporting', 'Cron scheduling', 'Exception export']
};

export const projectInvoiceGuardrailsTemplate: OutcomeTemplateDefinition = {
  name: 'Project→Invoice Guardrails',
  description: 'Automated reconciliation between time entries, projects, contracts, and invoices with exception reporting',
  category: 'Revenue Operations',
  tags: ['billing', 'time-tracking', 'revenue-recognition', 'compliance'],
  estimatedSetupTime: '15 minutes',
  
  stackVariants: [webJobsVariant, headlessWorkerVariant],
  
  services: {
    required: ['database'],
    optional: ['queue', 'email', 'storage'],
    integrations: {
      'Time Tracking': ['harvest', 'toggl', 'clickup', 'asana'],
      'Accounting': ['quickbooks', 'netsuite', 'xero'],
      'Project Management': ['jira', 'asana', 'monday', 'clickup']
    }
  },
  
  outcomes: {
    primary: 'Prevent revenue leakage and ensure billing accuracy',
    metrics: [
      'Billing accuracy percentage (target: ≥95%)',
      'Exception rate (target: ≤5%)', 
      'Revenue leakage prevented',
      'Days sales outstanding reduction',
      'Time to close reduction'
    ],
    businessValue: 'Automated guardrails prevent revenue leakage, ensure contract compliance, and reduce manual reconciliation effort'
  },
  
  dataContracts: {
    'TimeEntry': {
      description: 'Individual time entry records from tracking systems',
      schema: 'contracts/project-invoice-guardrails/TimeEntry.json',
      sampleData: 'gold-data/project-invoice-guardrails/sample-time-entries.json'
    },
    'Project': {
      description: 'Project master records with budget and team information',
      schema: 'contracts/project-invoice-guardrails/Project.json',
      sampleData: 'gold-data/project-invoice-guardrails/sample-projects.json'
    },
    'SOW': {
      description: 'Statement of Work contracts with terms and milestones',
      schema: 'contracts/project-invoice-guardrails/SOW.json',
      sampleData: null
    },
    'Invoice': {
      description: 'Invoice records with line items and billing details',
      schema: 'contracts/project-invoice-guardrails/Invoice.json',
      sampleData: 'gold-data/project-invoice-guardrails/sample-invoices.json'
    },
    'RevRecPolicy': {
      description: 'Revenue recognition policies for ASC 606/IFRS 15 compliance',
      schema: 'contracts/project-invoice-guardrails/RevRecPolicy.json',
      sampleData: null
    }
  },
  
  integrations: {
    'harvest': {
      description: 'Harvest time tracking integration',
      implementation: 'integrations/project-invoice-guardrails/harvest.ts',
      configRequired: ['HARVEST_ACCOUNT_ID', 'HARVEST_ACCESS_TOKEN'],
      capabilities: ['Time entries', 'Projects', 'Users', 'Invoices']
    },
    'quickbooks': {
      description: 'QuickBooks Online integration',
      implementation: 'integrations/project-invoice-guardrails/quickbooks.ts',
      configRequired: ['QB_ACCESS_TOKEN', 'QB_REFRESH_TOKEN', 'QB_REALM_ID'],
      capabilities: ['Invoices', 'Customers', 'Items', 'Classes']
    }
  },
  
  jobs: [
    {
      name: 'ingest-time-entries',
      description: 'Pull time entries from time tracking systems',
      schedule: 'every 4 hours',
      timeout: '10 minutes'
    },
    {
      name: 'ingest-invoices', 
      description: 'Pull invoices from accounting systems',
      schedule: 'every 4 hours',
      timeout: '10 minutes'
    },
    {
      name: 'reconcile-billing',
      description: 'Reconcile time entries against invoices and identify exceptions',
      schedule: 'daily at 6 AM',
      timeout: '30 minutes'
    },
    {
      name: 'generate-reports',
      description: 'Generate guardrails reports and scorecards',
      schedule: 'daily at 8 AM',
      timeout: '15 minutes'
    },
    {
      name: 'revrec-calculation',
      description: 'Calculate revenue recognition for compliance',
      schedule: 'daily at 9 AM',
      timeout: '20 minutes'
    }
  ],
  
  evaluators: {
    'billing-accuracy': {
      description: 'Calculate billing accuracy percentage and exception rates',
      goldDataset: 'gold-data/project-invoice-guardrails/expected-exceptions.json',
      metrics: ['accuracy_percentage', 'exception_rate', 'revenue_leakage', 'overbilling_exposure'],
      thresholds: {
        accuracy_percentage: { min: 95, target: 98 },
        exception_rate: { max: 5, target: 2 },
        revenue_leakage: { max: 2, target: 0.5 } // Percentage of total WIP
      }
    }
  },
  
  reports: [
    {
      name: 'Exceptions Report',
      description: 'Detailed list of billing discrepancies and exceptions',
      format: 'CSV',
      schedule: 'daily',
      path: '/reports/exceptions.csv'
    },
    {
      name: 'Guardrails Summary',
      description: 'High-level summary of billing accuracy metrics',
      format: 'JSON',
      schedule: 'daily', 
      path: '/reports/guardrails-summary.json'
    },
    {
      name: 'Revenue Recognition Report',
      description: 'Revenue recognition calculations for compliance',
      format: 'JSON',
      schedule: 'daily',
      path: '/reports/revenue-recognition.json'
    },
    {
      name: 'Executive Scorecard',
      description: 'Executive dashboard with KPIs and trends',
      format: 'HTML',
      schedule: 'daily',
      path: '/reports/scorecard.html'
    }
  ],
  
  webInterface: {
    enabled: true,
    description: 'Exception review dashboard with filtering and resolution tracking',
    routes: [
      {
        path: '/exceptions',
        description: 'Exception review and resolution interface'
      },
      {
        path: '/projects',
        description: 'Project billing status and budget tracking'
      },
      {
        path: '/reports',
        description: 'Interactive reports and analytics'
      }
    ]
  },
  
  compliance: {
    frameworks: ['ASC 606', 'IFRS 15', 'SOX'],
    features: [
      'Automated revenue recognition calculations',
      'Audit trail for all billing adjustments', 
      'Exception workflow with approval process',
      'Supporting documentation links'
    ]
  },
  
  idealCustomerProfile: {
    industry: ['Professional Services', 'Consulting', 'Digital Agencies', 'Systems Integration'],
    companySize: '20-500 employees',
    painPoints: [
      'Revenue leakage from unbilled time',
      'Manual reconciliation processes',
      'Client disputes over billing',
      'Audit compliance challenges',
      'Slow month-end close processes'
    ],
    triggers: [
      'Moving to ASC 606 compliance',
      'Scaling past 20-30 billable staff',
      'M&A or audit readiness',
      'Client billing disputes',
      'Missing revenue targets'
    ]
  },
  
  demoScenarios: [
    {
      name: 'Revenue Leakage Detection',
      description: 'Identify unbilled time entries worth $18,450 across 3 projects'
    },
    {
      name: 'Over-Budget Alert',
      description: 'Flag project exceeding SOW limits before client billing'
    },
    {
      name: 'Milestone Mismatch',
      description: 'Detect milestone billing without sufficient supporting time'
    },
    {
      name: 'Non-Billable Error',
      description: 'Catch non-billable time incorrectly included in invoice'
    }
  ],
  
  generatedFiles: [
    '/contracts/*.json',
    '/integrations/*.ts', 
    '/jobs/*.ts',
    '/evaluators/*.ts',
    '/reports/templates/*',
    '/app/exceptions/*',
    '/lib/reconciliation.ts',
    '/lib/revenue-recognition.ts',
    'CLAUDE.md'
  ]
};