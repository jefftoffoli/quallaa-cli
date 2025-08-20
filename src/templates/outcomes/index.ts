import { OutcomeTemplate, OutcomeTemplateDefinition } from '../../types';
import { orderCashRecoTemplate } from './order-cash-reco';
import { leadLifecycleCoreTemplate } from './lead-lifecycle-core';

export const outcomeTemplates: Record<OutcomeTemplate, OutcomeTemplateDefinition> = {
  'order-cash-reco': orderCashRecoTemplate,
  'lead-lifecycle-core': leadLifecycleCoreTemplate,
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