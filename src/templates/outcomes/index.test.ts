import { describe, it, expect } from 'vitest';
import { getOutcomeTemplate, listOutcomeTemplates, outcomeTemplates } from './index';
import { orderCashRecoTemplate } from './order-cash-reco';
import { leadLifecycleCoreTemplate } from './lead-lifecycle-core';

describe('outcome templates', () => {
  it('should export all templates', () => {
    expect(outcomeTemplates['order-cash-reco']).toBe(orderCashRecoTemplate);
    expect(outcomeTemplates['lead-lifecycle-core']).toBe(leadLifecycleCoreTemplate);
  });

  it('should get template by name', () => {
    const template = getOutcomeTemplate('order-cash-reco');
    expect(template.name).toBe('Order-to-Cash Reconciliation');
    expect(template.domain).toBe('Finance & Operations');
  });

  it('should throw error for unknown template', () => {
    expect(() => getOutcomeTemplate('unknown' as any)).toThrow('Unknown outcome template: unknown');
  });

  it('should list all templates', () => {
    const templates = listOutcomeTemplates();
    expect(templates).toHaveLength(5);
    
    const orderTemplate = templates.find(t => t.value === 'order-cash-reco');
    expect(orderTemplate).toBeDefined();
    expect(orderTemplate?.name).toBe('Order-to-Cash Reconciliation');
    
    const leadTemplate = templates.find(t => t.value === 'lead-lifecycle-core');
    expect(leadTemplate).toBeDefined();
    expect(leadTemplate?.name).toBe('Lead Lifecycle Core');
  });

  describe('order-cash-reco template', () => {
    it('should have required properties', () => {
      expect(orderCashRecoTemplate.name).toBe('Order-to-Cash Reconciliation');
      expect(orderCashRecoTemplate.domain).toBe('Finance & Operations');
      expect(orderCashRecoTemplate.requiredServices).toContain('supabase');
      expect(orderCashRecoTemplate.requiredServices).toContain('vercel');
    });

    it('should have data contracts', () => {
      expect(orderCashRecoTemplate.legacyDataContracts).toHaveLength(3);
      
      const orderContract = orderCashRecoTemplate.legacyDataContracts?.find(c => c.name === 'Order');
      expect(orderContract).toBeDefined();
      expect(orderContract?.schema.properties.id).toBeDefined();
      
      const paymentContract = orderCashRecoTemplate.legacyDataContracts?.find(c => c.name === 'Payment');
      expect(paymentContract).toBeDefined();
      
      const accountingContract = orderCashRecoTemplate.legacyDataContracts?.find(c => c.name === 'AccountingEntry');
      expect(accountingContract).toBeDefined();
    });

    it('should have service connectors', () => {
      expect(orderCashRecoTemplate.connectors).toHaveLength(4);
      
      const shopifyConnector = orderCashRecoTemplate.connectors.find(c => c.name === 'Shopify Connector');
      expect(shopifyConnector).toBeDefined();
      expect(shopifyConnector?.type).toBe('input');
      
      const stripeConnector = orderCashRecoTemplate.connectors.find(c => c.name === 'Stripe Connector');
      expect(stripeConnector).toBeDefined();
      expect(stripeConnector?.type).toBe('input');
    });

    it('should have evaluator metrics', () => {
      expect(orderCashRecoTemplate.evaluatorMetrics).toContain('reconciliation_rate');
      expect(orderCashRecoTemplate.evaluatorMetrics).toContain('processing_time');
      expect(orderCashRecoTemplate.evaluatorMetrics).toContain('error_rate');
    });
  });

  describe('lead-lifecycle-core template', () => {
    it('should have required properties', () => {
      expect(leadLifecycleCoreTemplate.name).toBe('Lead Lifecycle Core');
      expect(leadLifecycleCoreTemplate.domain).toBe('Sales & Marketing');
      expect(leadLifecycleCoreTemplate.requiredServices).toContain('supabase');
      expect(leadLifecycleCoreTemplate.requiredServices).toContain('vercel');
    });

    it('should have data contracts', () => {
      expect(leadLifecycleCoreTemplate.dataContracts).toBeDefined();
      expect(Object.keys(leadLifecycleCoreTemplate.dataContracts || {})).toHaveLength(4);
      
      const contracts = leadLifecycleCoreTemplate.dataContracts || {};
      expect(contracts['Lead']).toBeDefined();
      expect(contracts['Activity']).toBeDefined();
      expect(contracts['RoutingRule']).toBeDefined();
      expect(contracts['SlaTarget']).toBeDefined();
      
      // Verify schema structure
      const leadSchema = JSON.parse(contracts['Lead'].schema);
      expect(leadSchema.properties.email).toBeDefined();
    });

    it('should have service connectors', () => {
      expect(leadLifecycleCoreTemplate.connectors).toHaveLength(4);
      
      const hubspotConnector = leadLifecycleCoreTemplate.connectors.find(c => c.name === 'HubSpot Connector');
      expect(hubspotConnector).toBeDefined();
      expect(hubspotConnector?.type).toBe('bidirectional');
      
      const salesforceConnector = leadLifecycleCoreTemplate.connectors.find(c => c.name === 'Salesforce Connector');
      expect(salesforceConnector).toBeDefined();
      expect(salesforceConnector?.type).toBe('bidirectional');
    });

    it('should have evaluator metrics', () => {
      expect(leadLifecycleCoreTemplate.evaluatorMetrics).toContain('deduplication_rate');
      expect(leadLifecycleCoreTemplate.evaluatorMetrics).toContain('sla_compliance_rate');
      expect(leadLifecycleCoreTemplate.evaluatorMetrics).toContain('lead_conversion_rate');
    });
  });
});