import { OutcomeTemplate, OutcomeTemplateDefinition } from '../../types';
import { orderCashRecoTemplate } from './order-cash-reco';
import { leadLifecycleCoreTemplate } from './lead-lifecycle-core';
import { projectInvoiceGuardrailsTemplate } from './project-invoice-guardrails';
import { donorMemberRollupsTemplate } from './donor-member-rollups';
import { inventoryPricingSyncTemplate } from './inventory-pricing-sync';

export const outcomeTemplates: Record<OutcomeTemplate, OutcomeTemplateDefinition> = {
  'order-cash-reco': orderCashRecoTemplate,
  'lead-lifecycle-core': leadLifecycleCoreTemplate,
  'project-invoice-guardrails': projectInvoiceGuardrailsTemplate,
  'donor-member-rollups': donorMemberRollupsTemplate,
  'inventory-pricing-sync': inventoryPricingSyncTemplate,
};

export function getOutcomeTemplate(template: OutcomeTemplate): OutcomeTemplateDefinition {
  const templateDef = outcomeTemplates[template];
  if (!templateDef) {
    throw new Error(`Unknown outcome template: ${template}`);
  }
  return templateDef;
}

export function listOutcomeTemplates(): Array<{ value: OutcomeTemplate; name: string; description: string }> {
  return Object.entries(outcomeTemplates).map(([key, template]) => ({
    value: key as OutcomeTemplate,
    name: template.name,
    description: template.description,
  }));
}

export * from './order-cash-reco';
export * from './lead-lifecycle-core';
export * from './project-invoice-guardrails';
export * from './donor-member-rollups';
export * from './inventory-pricing-sync';