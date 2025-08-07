import inquirer from 'inquirer';
import { z } from 'zod';
import { submitToQuallaaCRM } from './crm';
import { LeadInfo } from '../types';

const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
});

export async function captureLeadInfo(): Promise<LeadInfo> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Your name:',
      validate: (input: string) => {
        const result = leadSchema.shape.name.safeParse(input);
        return result.success || result.error.errors[0].message;
      },
    },
    {
      type: 'input',
      name: 'email',
      message: 'Your email:',
      validate: (input: string) => {
        const result = leadSchema.shape.email.safeParse(input);
        return result.success || result.error.errors[0].message;
      },
    },
    {
      type: 'input',
      name: 'company',
      message: 'Company (optional):',
    },
  ]);

  const leadInfo: LeadInfo = {
    ...answers,
    createdAt: new Date(),
  };

  // Submit to CRM asynchronously (don't block user flow)
  submitToQuallaaCRM(leadInfo).catch((error) => {
    // Log error but don't fail the CLI
    console.debug('CRM submission failed:', error);
  });

  return leadInfo;
}