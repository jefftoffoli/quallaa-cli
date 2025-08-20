import { OutcomeTemplateDefinition, StackVariant } from '../../types';

const webJobsVariant: StackVariant = {
  name: 'Web + Jobs',
  description: 'Full-stack application with real-time sync monitoring and exception management dashboard',
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
  features: ['Real-time sync monitoring', 'Exception management dashboard', 'Price/inventory corrections', 'Automated sync scheduling']
};

const headlessWorkerVariant: StackVariant = {
  name: 'Headless Worker-Only',
  description: 'Backend-only solution with automated reconciliation and file-based reporting',
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
  features: ['Automated reconciliation', 'Exception reporting', 'Sync orchestration', 'Alert notifications']
};

export const inventoryPricingSyncTemplate: OutcomeTemplateDefinition = {
  name: 'Inventory & Pricing Sync',
  description: 'Automated inventory and pricing synchronization across ERP and e-commerce channels with exception handling',
  category: 'E-commerce Operations',
  tags: ['inventory', 'pricing', 'e-commerce', 'sync', 'reconciliation'],
  estimatedSetupTime: '15 minutes',
  
  stackVariants: [webJobsVariant, headlessWorkerVariant],
  
  services: {
    required: ['database'],
    optional: ['queue', 'email', 'storage'],
    integrations: {
      'ERP Systems': ['netsuite', 'odoo', 'fishbowl', 'sap', 'quickbooks'],
      'E-commerce': ['shopify', 'woocommerce', 'bigcommerce', 'magento'],
      'Marketplaces': ['amazon', 'ebay', 'walmart', 'etsy'],
      'POS Systems': ['square', 'lightspeed', 'toast', 'clover']
    }
  },
  
  outcomes: {
    primary: 'Maintain inventory and pricing alignment across all sales channels with automated exception detection',
    metrics: [
      'Sync accuracy percentage (target: ≥94%)',
      'Exception count and resolution time',
      'Revenue exposure from pricing mismatches',
      'Oversell risk prevention',
      'Channel coverage percentage'
    ],
    businessValue: 'Prevent overselling, eliminate pricing errors, reduce manual reconciliation effort, and maintain channel consistency'
  },
  
  dataContracts: {
    'SKU': {
      description: 'Product SKU master records with variants and channel mappings',
      schema: 'contracts/inventory-pricing-sync/SKU.json',
      sampleData: 'gold-data/inventory-pricing-sync/sample-skus.json'
    },
    'Inventory': {
      description: 'Inventory levels across locations and channels',
      schema: 'contracts/inventory-pricing-sync/Inventory.json',
      sampleData: null
    },
    'Price': {
      description: 'Pricing information across channels and customer segments',
      schema: 'contracts/inventory-pricing-sync/Price.json',
      sampleData: null
    }
  },
  
  integrations: {
    'netsuite': {
      description: 'NetSuite ERP integration for master data',
      implementation: 'integrations/inventory-pricing-sync/netsuite.ts',
      configRequired: ['NETSUITE_ACCOUNT_ID', 'NETSUITE_TOKEN_KEY', 'NETSUITE_TOKEN_SECRET'],
      capabilities: ['SKU catalog', 'Inventory levels', 'Cost data', 'Price lists']
    },
    'shopify': {
      description: 'Shopify e-commerce platform integration',
      implementation: 'integrations/inventory-pricing-sync/shopify.ts',
      configRequired: ['SHOPIFY_SHOP_DOMAIN', 'SHOPIFY_ACCESS_TOKEN'],
      capabilities: ['Product catalog', 'Inventory sync', 'Price updates', 'Variant management']
    },
    'amazon': {
      description: 'Amazon Seller Central marketplace integration',
      implementation: 'integrations/inventory-pricing-sync/amazon.ts',
      configRequired: ['AMAZON_ACCESS_KEY', 'AMAZON_SECRET_KEY', 'AMAZON_MARKETPLACE_ID'],
      capabilities: ['Product listings', 'Inventory feeds', 'Price updates', 'Order management']
    }
  },
  
  jobs: [
    {
      name: 'ingest-sku-catalog',
      description: 'Pull SKU master data from ERP systems',
      schedule: 'every 6 hours',
      timeout: '15 minutes'
    },
    {
      name: 'ingest-inventory',
      description: 'Pull inventory levels from all locations',
      schedule: 'every 30 minutes',
      timeout: '10 minutes'
    },
    {
      name: 'ingest-pricing',
      description: 'Pull pricing data from ERP and channels',
      schedule: 'every hour',
      timeout: '10 minutes'
    },
    {
      name: 'reconcile-inventory',
      description: 'Compare inventory levels across ERP and channels',
      schedule: 'every 15 minutes',
      timeout: '20 minutes'
    },
    {
      name: 'reconcile-pricing',
      description: 'Compare pricing across ERP and channels',
      schedule: 'every hour',
      timeout: '15 minutes'
    },
    {
      name: 'sync-corrections',
      description: 'Push corrections to channels (if auto-sync enabled)',
      schedule: 'every 30 minutes',
      timeout: '25 minutes'
    },
    {
      name: 'generate-reports',
      description: 'Generate exception and performance reports',
      schedule: 'every 4 hours',
      timeout: '10 minutes'
    }
  ],
  
  evaluators: {
    'sync-accuracy': {
      description: 'Calculate sync accuracy rates and identify high-impact exceptions',
      goldDataset: 'gold-data/inventory-pricing-sync/expected-exceptions.json',
      metrics: ['sync_accuracy', 'exception_rate', 'revenue_exposure', 'oversell_risk'],
      thresholds: {
        sync_accuracy: { min: 85, target: 94 },
        exception_rate: { max: 15, target: 6 },
        revenue_exposure: { max: 100000, target: 25000 }, // In cents
        oversell_risk: { max: 5, target: 0 } // Number of SKUs
      }
    }
  },
  
  reports: [
    {
      name: 'SKU Rollup Report',
      description: 'Complete SKU status across all channels with sync health',
      format: 'CSV',
      schedule: 'every 4 hours',
      path: '/reports/sku-rollup.csv'
    },
    {
      name: 'Exceptions Report',
      description: 'Detailed exceptions requiring attention or action',
      format: 'CSV',
      schedule: 'every hour',
      path: '/reports/exceptions.csv'
    },
    {
      name: 'Inventory Summary',
      description: 'Inventory levels and discrepancies by location and channel',
      format: 'JSON',
      schedule: 'every 2 hours',
      path: '/reports/inventory-summary.json'
    },
    {
      name: 'Pricing Summary',
      description: 'Price comparison and margin analysis across channels',
      format: 'JSON',
      schedule: 'every 4 hours',
      path: '/reports/pricing-summary.json'
    },
    {
      name: 'Operations Scorecard',
      description: 'Executive dashboard with sync performance and revenue impact',
      format: 'HTML',
      schedule: 'daily at 8 AM',
      path: '/reports/operations-scorecard.html'
    }
  ],
  
  webInterface: {
    enabled: true,
    description: 'Operations dashboard for sync monitoring and exception management',
    routes: [
      {
        path: '/dashboard',
        description: 'Real-time sync status and performance metrics'
      },
      {
        path: '/exceptions',
        description: 'Exception management with bulk actions'
      },
      {
        path: '/skus',
        description: 'SKU catalog with channel sync status'
      },
      {
        path: '/inventory',
        description: 'Inventory levels and discrepancy monitoring'
      },
      {
        path: '/pricing',
        description: 'Price monitoring and margin analysis'
      },
      {
        path: '/channels',
        description: 'Channel-specific sync performance and health'
      }
    ]
  },
  
  compliance: {
    frameworks: ['SOC 2', 'GDPR', 'CCPA', 'PCI DSS'],
    features: [
      'Audit trail for all sync operations',
      'Data privacy controls for customer information',
      'Secure API credential management',
      'Change logging and approval workflows',
      'Automated data retention policies'
    ]
  },
  
  idealCustomerProfile: {
    industry: ['E-commerce', 'Retail', 'Manufacturing', 'Distribution', 'Wholesale'],
    companySize: '500+ SKUs across multiple channels',
    painPoints: [
      'Overselling due to inventory sync delays',
      'Revenue loss from pricing discrepancies', 
      'Manual reconciliation consuming staff time',
      'Channel conflicts and pricing inconsistencies',
      'Customer complaints about stock availability',
      'Margin erosion from outdated costs'
    ],
    triggers: [
      'Expanding to multiple marketplaces',
      'Launching direct-to-consumer alongside wholesale',
      'Frequent stockouts or overstock situations',
      'Cost increases requiring price updates',
      'Customer satisfaction issues from overselling',
      'Audit findings on inventory accuracy'
    ]
  },
  
  demoScenarios: [
    {
      name: 'Oversell Prevention',
      description: 'Detect negative inventory before customer orders are affected'
    },
    {
      name: 'Price Sync Failure',
      description: 'Identify $2,000 pricing discrepancy preventing revenue loss'
    },
    {
      name: 'Missing SKU Alert',
      description: 'Find SKUs missing from Amazon with $35K revenue potential'
    },
    {
      name: 'Below-Cost Pricing',
      description: 'Flag promotional prices below updated product costs'
    },
    {
      name: 'Stale Data Cleanup',
      description: 'Identify discontinued products still active on channels'
    },
    {
      name: 'Bulk Sync Correction',
      description: 'Automatically correct 50+ SKU discrepancies in one operation'
    }
  ],
  
  generatedFiles: [
    '/contracts/*.json',
    '/integrations/*.ts',
    '/jobs/*.ts',
    '/evaluators/*.ts',
    '/reports/templates/*',
    '/app/dashboard/*',
    '/app/exceptions/*',
    '/app/skus/*',
    '/lib/sync-engine.ts',
    '/lib/reconciliation.ts',
    '/lib/channel-adapters.ts',
    'CLAUDE.md'
  ]
};