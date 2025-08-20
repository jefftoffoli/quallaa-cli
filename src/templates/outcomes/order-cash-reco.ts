import { OutcomeTemplateDefinition } from '../../types';

export const orderCashRecoTemplate: OutcomeTemplateDefinition = {
  name: 'Order-to-Cash Reconciliation',
  description: 'Automated order-to-cash reconciliation system connecting e-commerce, payment processing, and accounting systems',
  domain: 'Finance & Operations',
  requiredServices: ['supabase', 'vercel'],
  optionalServices: ['resend', 'typesense'],
  stackVariants: [
    {
      name: 'Web + Jobs (Default)',
      description: 'Next.js frontend with background jobs for reconciliation processing',
      isMinimal: false,
      requiredServices: ['vercel', 'supabase'],
      optionalServices: ['resend', 'typesense'],
      architecture: 'web-jobs',
      deployment: 'vercel'
    },
    {
      name: 'Headless Worker-Only',
      description: 'Minimal Node.js worker for batch reconciliation processing',
      isMinimal: true,
      requiredServices: ['supabase'],
      optionalServices: ['resend'],
      architecture: 'headless-worker',
      deployment: 'fly'
    }
  ],
  legacyDataContracts: [
    {
      name: 'Order',
      description: 'E-commerce order data structure',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique order identifier' },
          orderNumber: { type: 'string', description: 'Human-readable order number' },
          customerId: { type: 'string', description: 'Customer identifier' },
          status: { 
            type: 'string', 
            enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
            description: 'Order status'
          },
          totalAmount: { type: 'number', description: 'Total order amount in cents' },
          currency: { type: 'string', description: 'Currency code (ISO 4217)' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'number' },
                unitPrice: { type: 'number' },
                totalPrice: { type: 'number' }
              }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'orderNumber', 'customerId', 'status', 'totalAmount', 'currency']
      }
    },
    {
      name: 'Payment',
      description: 'Payment processing data structure',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Payment ID from processor' },
          orderId: { type: 'string', description: 'Associated order ID' },
          processor: { 
            type: 'string', 
            enum: ['stripe', 'paypal', 'square'],
            description: 'Payment processor'
          },
          status: {
            type: 'string',
            enum: ['pending', 'succeeded', 'failed', 'refunded'],
            description: 'Payment status'
          },
          amount: { type: 'number', description: 'Payment amount in cents' },
          currency: { type: 'string', description: 'Currency code' },
          processorFee: { type: 'number', description: 'Processor fee in cents' },
          netAmount: { type: 'number', description: 'Net amount after fees' },
          processedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'orderId', 'processor', 'status', 'amount', 'currency']
      }
    },
    {
      name: 'AccountingEntry',
      description: 'Accounting system entry data structure',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Entry ID in accounting system' },
          orderId: { type: 'string', description: 'Associated order ID' },
          paymentId: { type: 'string', description: 'Associated payment ID' },
          accountingSystem: {
            type: 'string',
            enum: ['quickbooks', 'xero', 'netsuite'],
            description: 'Accounting system'
          },
          journalEntryId: { type: 'string', description: 'Journal entry ID' },
          debitAccount: { type: 'string', description: 'Debit account' },
          creditAccount: { type: 'string', description: 'Credit account' },
          amount: { type: 'number', description: 'Entry amount' },
          reconciled: { type: 'boolean', description: 'Reconciliation status' },
          reconciledAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'orderId', 'accountingSystem', 'debitAccount', 'creditAccount', 'amount']
      }
    }
  ],
  connectors: [
    {
      name: 'Shopify Connector',
      type: 'input',
      service: 'shopify',
      description: 'Fetches order data from Shopify',
      config: {
        webhookEndpoints: ['/api/webhooks/shopify/orders'],
        apiEndpoints: ['/api/connectors/shopify/orders'],
        requiredScopes: ['read_orders', 'read_customers']
      }
    },
    {
      name: 'Stripe Connector',
      type: 'input',
      service: 'stripe',
      description: 'Fetches payment data from Stripe',
      config: {
        webhookEndpoints: ['/api/webhooks/stripe/payments'],
        apiEndpoints: ['/api/connectors/stripe/payments'],
        events: ['payment_intent.succeeded', 'payment_intent.payment_failed']
      }
    },
    {
      name: 'QuickBooks Connector',
      type: 'output',
      service: 'quickbooks',
      description: 'Creates accounting entries in QuickBooks',
      config: {
        apiEndpoints: ['/api/connectors/quickbooks/entries'],
        requiredScopes: ['com.intuit.quickbooks.accounting']
      }
    },
    {
      name: 'Xero Connector',
      type: 'output',
      service: 'xero',
      description: 'Creates accounting entries in Xero',
      config: {
        apiEndpoints: ['/api/connectors/xero/entries'],
        requiredScopes: ['accounting.transactions']
      }
    }
  ],
  evaluatorMetrics: [
    'reconciliation_rate',
    'processing_time',
    'error_rate',
    'manual_intervention_rate',
    'data_completeness',
    'temporal_accuracy'
  ],
  claudeSections: [
    'order_data_mapping',
    'payment_reconciliation_logic',
    'accounting_entry_creation',
    'error_handling_procedures',
    'data_validation_rules',
    'connector_configuration',
    'reconciliation_workflows'
  ]
};