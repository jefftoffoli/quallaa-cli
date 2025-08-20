import { OutcomeTemplateDefinition } from '../../types';

export const leadLifecycleCoreTemplate: OutcomeTemplateDefinition = {
  name: 'Lead Lifecycle Core',
  description: 'Complete lead lifecycle management system with deduplication, enrichment, routing, and SLA tracking',
  domain: 'Sales & Marketing',
  requiredServices: ['supabase', 'vercel'],
  optionalServices: ['resend', 'typesense'],
  stackVariants: [
    {
      name: 'Web + Jobs (Default)',
      description: 'Next.js CRM interface with background lead processing',
      isMinimal: false,
      requiredServices: ['vercel', 'supabase', 'resend'],
      optionalServices: ['typesense'],
      architecture: 'web-jobs',
      deployment: 'vercel'
    },
    {
      name: 'Headless Worker-Only',
      description: 'Minimal API worker for lead enrichment and routing',
      isMinimal: true,
      requiredServices: ['supabase', 'resend'],
      optionalServices: [],
      architecture: 'headless-worker',
      deployment: 'railway'
    }
  ],
  dataContracts: {
    'Lead': {
      description: 'Core lead data structure with enrichment fields',
      schema: JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique lead identifier' },
          email: { type: 'string', format: 'email', description: 'Primary email address' },
          firstName: { type: 'string', description: 'First name' },
          lastName: { type: 'string', description: 'Last name' },
          company: { type: 'string', description: 'Company name' },
          jobTitle: { type: 'string', description: 'Job title' },
          phone: { type: 'string', description: 'Phone number' },
          source: {
            type: 'string',
            enum: ['website', 'social', 'referral', 'event', 'advertising', 'cold_outreach'],
            description: 'Lead source'
          },
          status: {
            type: 'string',
            enum: ['new', 'qualified', 'contacted', 'meeting_scheduled', 'proposal_sent', 'won', 'lost'],
            description: 'Lead status'
          },
          score: { type: 'number', minimum: 0, maximum: 100, description: 'Lead score' },
          assignedTo: { type: 'string', description: 'Assigned sales rep ID', nullable: true },
          enrichment: {
            type: 'object',
            properties: {
              companySize: { type: 'string' },
              industry: { type: 'string' },
              revenue: { type: 'string' },
              technology: { type: 'array', items: { type: 'string' } },
              socialProfiles: {
                type: 'object',
                properties: {
                  linkedin: { type: 'string' },
                  twitter: { type: 'string' }
                }
              }
            }
          },
          duplicateOf: { type: 'string', description: 'ID of original lead if duplicate', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          lastContactedAt: { type: 'string', format: 'date-time', nullable: true }
        },
        required: ['id', 'email', 'source', 'status', 'createdAt']
      })
    },
    'Activity': {
      description: 'Lead activity tracking data structure',
      schema: JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Activity ID' },
          leadId: { type: 'string', description: 'Associated lead ID' },
          type: {
            type: 'string',
            enum: ['email_sent', 'email_opened', 'email_clicked', 'call_made', 'meeting_scheduled', 'demo_completed', 'proposal_sent'],
            description: 'Activity type'
          },
          description: { type: 'string', description: 'Activity description' },
          performedBy: { type: 'string', description: 'User who performed activity' },
          metadata: {
            type: 'object',
            description: 'Activity-specific metadata'
          },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'leadId', 'type', 'createdAt']
      })
    },
    'RoutingRule': {
      description: 'Lead routing and assignment rules',
      schema: JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Rule ID' },
          name: { type: 'string', description: 'Rule name' },
          priority: { type: 'number', description: 'Rule priority (higher = more important)' },
          conditions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', description: 'Field to evaluate' },
                operator: {
                  type: 'string',
                  enum: ['equals', 'contains', 'greater_than', 'less_than', 'in'],
                  description: 'Comparison operator'
                },
                value: { description: 'Value to compare against' }
              },
              required: ['field', 'operator', 'value']
            }
          },
          actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['assign_to_user', 'assign_to_team', 'set_score', 'add_tag', 'send_notification'],
                  description: 'Action type'
                },
                value: { description: 'Action value' }
              },
              required: ['type', 'value']
            }
          },
          isActive: { type: 'boolean', description: 'Whether rule is active' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'name', 'priority', 'conditions', 'actions', 'isActive']
      })
    },
    'SlaTarget': {
      description: 'Service level agreement targets and tracking',
      schema: JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'string', description: 'SLA target ID' },
          name: { type: 'string', description: 'Target name' },
          leadSegment: {
            type: 'object',
            description: 'Lead segment criteria'
          },
          targetTime: { type: 'number', description: 'Target time in minutes' },
          metric: {
            type: 'string',
            enum: ['first_response', 'qualification', 'meeting_scheduled'],
            description: 'SLA metric'
          },
          currentPerformance: { type: 'number', description: 'Current avg performance in minutes' },
          achievementRate: { type: 'number', description: 'SLA achievement rate as percentage' },
          isActive: { type: 'boolean', description: 'Whether SLA is active' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'name', 'targetTime', 'metric', 'isActive']
      })
    }
  },
  connectors: [
    {
      name: 'HubSpot Connector',
      type: 'bidirectional',
      service: 'hubspot',
      description: 'Syncs leads and activities with HubSpot CRM',
      config: {
        webhookEndpoints: ['/api/webhooks/hubspot/contacts', '/api/webhooks/hubspot/deals'],
        apiEndpoints: ['/api/connectors/hubspot/leads', '/api/connectors/hubspot/activities'],
        requiredScopes: ['contacts', 'automation']
      }
    },
    {
      name: 'Salesforce Connector',
      type: 'bidirectional',
      service: 'salesforce',
      description: 'Syncs leads and opportunities with Salesforce',
      config: {
        webhookEndpoints: ['/api/webhooks/salesforce/leads', '/api/webhooks/salesforce/opportunities'],
        apiEndpoints: ['/api/connectors/salesforce/leads', '/api/connectors/salesforce/activities'],
        requiredObjects: ['Lead', 'Opportunity', 'Contact', 'Account']
      }
    },
    {
      name: 'Google Analytics Connector',
      type: 'input',
      service: 'ga4',
      description: 'Tracks lead source attribution and website behavior',
      config: {
        apiEndpoints: ['/api/connectors/ga4/events'],
        events: ['form_submit', 'page_view', 'session_start'],
        dimensions: ['source', 'medium', 'campaign', 'content']
      }
    },
    {
      name: 'Email Enrichment Connector',
      type: 'input',
      service: 'clearbit',
      description: 'Enriches lead data with company and contact information',
      config: {
        apiEndpoints: ['/api/connectors/clearbit/enrich'],
        enrichmentTypes: ['person', 'company']
      }
    }
  ],
  evaluatorMetrics: [
    'deduplication_rate',
    'enrichment_completeness',
    'routing_accuracy',
    'sla_compliance_rate',
    'lead_conversion_rate',
    'time_to_first_contact',
    'data_quality_score'
  ],
  claudeSections: [
    'lead_deduplication_logic',
    'data_enrichment_workflows',
    'routing_rule_engine',
    'sla_monitoring_system',
    'lead_scoring_algorithms',
    'connector_sync_strategies',
    'pipeline_management'
  ]
};