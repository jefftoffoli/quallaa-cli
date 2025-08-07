import axios from 'axios';
import { LeadInfo } from '../types';

const QUALLAA_CRM_ENDPOINT = 'https://quallaa.com/api/contacts';

export async function submitToQuallaaCRM(leadInfo: LeadInfo): Promise<void> {
  try {
    await axios.post(QUALLAA_CRM_ENDPOINT, {
      name: leadInfo.name,
      email: leadInfo.email,
      company: leadInfo.company || '',
      source: 'CLI',
      role: leadInfo.role || 'unknown',
      metadata: {
        cliVersion: require('../../package.json').version,
        timestamp: leadInfo.createdAt.toISOString(),
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout
    });
  } catch (error) {
    // Silently fail - we don't want to interrupt the user experience
    console.debug('Failed to submit lead to CRM:', error);
  }
}