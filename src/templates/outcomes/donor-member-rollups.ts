import { OutcomeTemplateDefinition, StackVariant } from '../../types';

const webJobsVariant: StackVariant = {
  name: 'Web + Jobs',
  description: 'Full-stack application with dashboard for exception review and automated rollup processing',
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
  features: ['Exception review dashboard', 'Real-time rollup processing', 'Board-ready reports', 'Email notifications']
};

const headlessWorkerVariant: StackVariant = {
  name: 'Headless Worker-Only',
  description: 'Backend-only solution with CLI tools and automated file-based reporting',
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
  features: ['CLI-based rollups', 'Automated CSV exports', 'Cron scheduling', 'Email reports']
};

export const donorMemberRollupsTemplate: OutcomeTemplateDefinition = {
  name: 'Donor & Member Rollups',
  description: 'Automated donor and member rollups with reconciliation across donation processors, CRM, and accounting systems',
  category: 'Nonprofit Operations',
  tags: ['fundraising', 'membership', 'reconciliation', 'nonprofit', 'compliance'],
  estimatedSetupTime: '15 minutes',
  
  stackVariants: [webJobsVariant, headlessWorkerVariant],
  
  services: {
    required: ['database'],
    optional: ['queue', 'email', 'storage'],
    integrations: {
      'Donation Processing': ['stripe', 'paypal', 'classy', 'givebutter', 'donorbox'],
      'Member Management': ['neoncrm', 'wildapricot', 'salesforce_npsp', 'hubspot'],
      'Accounting': ['quickbooks', 'sage_intacct', 'xero']
    }
  },
  
  outcomes: {
    primary: 'Provide reliable, board-ready donor and member reports with automated exception handling',
    metrics: [
      'Reconciliation rate (target: ≥96%)',
      'Coverage percentage (target: ≥92%)', 
      'Exception count reduction',
      'Revenue leakage prevented',
      'Report generation time'
    ],
    businessValue: 'Eliminate manual spreadsheet rollups, ensure accurate board reports, and catch missing revenue before audits'
  },
  
  dataContracts: {
    'Donation': {
      description: 'Individual donation records from payment processors',
      schema: 'contracts/donor-member-rollups/Donation.json',
      sampleData: 'gold-data/donor-member-rollups/sample-donations.json'
    },
    'Member': {
      description: 'Member records from association management systems',
      schema: 'contracts/donor-member-rollups/Member.json',
      sampleData: 'gold-data/donor-member-rollups/sample-members.json'
    },
    'Fund': {
      description: 'Fund and program designations for donations and dues',
      schema: 'contracts/donor-member-rollups/Fund.json',
      sampleData: null
    },
    'JournalEntry': {
      description: 'Accounting journal entries for revenue tracking',
      schema: 'contracts/donor-member-rollups/JournalEntry.json',
      sampleData: null
    }
  },
  
  integrations: {
    'stripe': {
      description: 'Stripe payment processing integration',
      implementation: 'integrations/donor-member-rollups/stripe.ts',
      configRequired: ['STRIPE_SECRET_KEY'],
      capabilities: ['Donations', 'Recurring payments', 'Customer data', 'Payment methods']
    },
    'neoncrm': {
      description: 'NeonCRM donor and member management',
      implementation: 'integrations/donor-member-rollups/neoncrm.ts',
      configRequired: ['NEON_API_KEY', 'NEON_ORG_ID'],
      capabilities: ['Donors', 'Members', 'Events', 'Communications']
    },
    'quickbooks': {
      description: 'QuickBooks Online accounting integration',
      implementation: 'integrations/donor-member-rollups/quickbooks.ts',
      configRequired: ['QB_ACCESS_TOKEN', 'QB_REFRESH_TOKEN', 'QB_REALM_ID'],
      capabilities: ['Journal entries', 'Funds tracking', 'Revenue accounts', 'Customer records']
    }
  },
  
  jobs: [
    {
      name: 'ingest-donations',
      description: 'Pull donation data from payment processors',
      schedule: 'every 2 hours',
      timeout: '10 minutes'
    },
    {
      name: 'ingest-members',
      description: 'Pull member data from CRM/AMS systems',
      schedule: 'every 4 hours', 
      timeout: '15 minutes'
    },
    {
      name: 'ingest-accounting',
      description: 'Pull journal entries and account data',
      schedule: 'every 6 hours',
      timeout: '10 minutes'
    },
    {
      name: 'generate-rollups',
      description: 'Generate donor and member rollup reports',
      schedule: 'daily at 7 AM',
      timeout: '20 minutes'
    },
    {
      name: 'reconcile-data',
      description: 'Reconcile donations and memberships against accounting',
      schedule: 'daily at 8 AM',
      timeout: '25 minutes'
    },
    {
      name: 'send-reports',
      description: 'Email daily reports to stakeholders',
      schedule: 'daily at 9 AM',
      timeout: '5 minutes'
    }
  ],
  
  evaluators: {
    'reconciliation-accuracy': {
      description: 'Calculate reconciliation rates and identify exceptions',
      goldDataset: 'gold-data/donor-member-rollups/expected-rollups.json',
      metrics: ['reconciliation_rate', 'coverage_percentage', 'exception_count', 'revenue_leakage'],
      thresholds: {
        reconciliation_rate: { min: 90, target: 96 },
        coverage_percentage: { min: 85, target: 92 },
        exception_count: { max: 50, target: 10 },
        revenue_leakage: { max: 1000000, target: 10000 } // In cents
      }
    }
  },
  
  reports: [
    {
      name: 'Donor Rollup Report',
      description: 'Comprehensive donor giving summary with fund breakdowns',
      format: 'CSV',
      schedule: 'daily',
      path: '/reports/donor-rollup.csv'
    },
    {
      name: 'Member Rollup Report',
      description: 'Member status summary with dues reconciliation',
      format: 'CSV',
      schedule: 'daily',
      path: '/reports/member-rollup.csv'
    },
    {
      name: 'Exceptions Report',
      description: 'Detailed exceptions requiring manual review',
      format: 'CSV',
      schedule: 'daily',
      path: '/reports/exceptions.csv'
    },
    {
      name: 'Executive Summary',
      description: 'High-level metrics for board and leadership',
      format: 'JSON',
      schedule: 'daily',
      path: '/reports/executive-summary.json'
    },
    {
      name: 'Board Scorecard',
      description: 'Board-ready dashboard with key fundraising metrics',
      format: 'HTML',
      schedule: 'daily',
      path: '/reports/board-scorecard.html'
    }
  ],
  
  webInterface: {
    enabled: true,
    description: 'Exception review interface with donor/member management tools',
    routes: [
      {
        path: '/exceptions',
        description: 'Exception review and resolution workflow'
      },
      {
        path: '/donors',
        description: 'Donor rollup summary and detail views'
      },
      {
        path: '/members',
        description: 'Member status and dues tracking'
      },
      {
        path: '/funds',
        description: 'Fund performance and restriction compliance'
      },
      {
        path: '/reports',
        description: 'Interactive reports and analytics dashboard'
      }
    ]
  },
  
  compliance: {
    frameworks: ['GAAP', 'FASB ASC 958', 'IRS Form 990', 'State Charity Regulations'],
    features: [
      'Restricted fund tracking and compliance',
      'Donor privacy and anonymity protection',
      'Tax deductibility calculations',
      'Gift acknowledgment tracking',
      'Audit trail for all transactions'
    ]
  },
  
  idealCustomerProfile: {
    industry: ['Nonprofits', 'Associations', 'Membership Organizations', 'Religious Organizations', 'Educational Institutions'],
    companySize: '1,000+ donors/members annually',
    painPoints: [
      'Manual spreadsheet rollups taking days',
      'Board reports with reconciliation errors',
      'Missing donations in accounting system',
      'Lapsed members with unpaid dues',
      'Compliance risk with restricted funds',
      'Frustrated staff doing repetitive data entry'
    ],
    triggers: [
      'Annual audit preparation',
      'Board demanding reliable reporting',
      'Migration to new CRM or AMS system',
      'Growth past 10,000+ donors/members',
      'Staff turnover in finance/development',
      'Compliance issues with restricted gifts'
    ]
  },
  
  demoScenarios: [
    {
      name: 'Missing Donation Alert',
      description: 'Catch $5,000 PayPal donation missing from accounting system'
    },
    {
      name: 'Lapsed Member Recovery',
      description: 'Identify members in grace period for targeted renewal outreach'
    },
    {
      name: 'Fund Restriction Compliance',
      description: 'Ensure restricted donations are properly allocated and tracked'
    },
    {
      name: 'Board Report Generation',
      description: 'Generate board-ready reports in seconds instead of hours'
    },
    {
      name: 'Audit Preparation',
      description: 'Provide auditors with clean, reconciled donor and member data'
    }
  ],
  
  generatedFiles: [
    '/contracts/*.json',
    '/integrations/*.ts',
    '/jobs/*.ts',
    '/evaluators/*.ts',
    '/reports/templates/*',
    '/app/exceptions/*',
    '/app/donors/*',
    '/app/members/*',
    '/lib/rollup-engine.ts',
    '/lib/reconciliation.ts',
    '/lib/fund-compliance.ts',
    'CLAUDE.md'
  ]
};