/**
 * HubSpot Integration for Lead Lifecycle Management
 * 
 * Handles contacts, companies, deals, and tasks via HubSpot CRM API
 */

import { Contact } from '../types';

export interface HubSpotConfig {
  accessToken: string;
  apiVersion?: string;
}

export interface HubSpotContact {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotListResponse<T> {
  results: T[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

export class HubSpotClient {
  private config: HubSpotConfig;
  private baseUrl: string;

  constructor(config: HubSpotConfig) {
    this.config = {
      apiVersion: 'v3',
      ...config
    };
    this.baseUrl = `https://api.hubapi.com/crm/${this.config.apiVersion}`;
  }

  /**
   * Fetch contacts with optional filters and properties
   */
  async fetchContacts(options: {
    properties?: string[];
    associations?: string[];
    limit?: number;
    after?: string;
    createdAfter?: string;
    updatedAfter?: string;
  } = {}): Promise<HubSpotListResponse<HubSpotContact>> {
    const url = `${this.baseUrl}/objects/contacts`;
    const params = new URLSearchParams();

    // Default properties to fetch
    const defaultProperties = [
      'email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle',
      'hs_lead_status', 'lifecyclestage', 'createdate', 'lastmodifieddate',
      'hubspot_owner_id', 'hs_analytics_source', 'hs_analytics_source_data_1',
      'hs_analytics_source_data_2', 'utm_source', 'utm_medium', 'utm_campaign',
      'utm_term', 'utm_content', 'hs_latest_source', 'hs_latest_source_data_1'
    ];

    const properties = options.properties || defaultProperties;
    properties.forEach(prop => params.append('properties', prop));

    if (options.associations) {
      options.associations.forEach(assoc => params.append('associations', assoc));
    }

    if (options.limit) params.append('limit', options.limit.toString());
    if (options.after) params.append('after', options.after);

    const response = await this.makeRequest(`${url}?${params}`);
    return response;
  }

  /**
   * Create a new contact in HubSpot
   */
  async createContact(contactData: Partial<Contact>): Promise<HubSpotContact> {
    const url = `${this.baseUrl}/objects/contacts`;
    
    const hubspotProperties = this.transformToHubSpotProperties(contactData);
    
    const payload = {
      properties: hubspotProperties
    };

    const response = await this.makeRequest(url, 'POST', payload);
    return response;
  }

  /**
   * Update an existing contact
   */
  async updateContact(contactId: string, contactData: Partial<Contact>): Promise<HubSpotContact> {
    const url = `${this.baseUrl}/objects/contacts/${contactId}`;
    
    const hubspotProperties = this.transformToHubSpotProperties(contactData);
    
    const payload = {
      properties: hubspotProperties
    };

    const response = await this.makeRequest(url, 'PATCH', payload);
    return response;
  }

  /**
   * Assign contact to owner
   */
  async assignContact(contactId: string, ownerId: string): Promise<HubSpotContact> {
    return this.updateContact(contactId, {
      assignedTo: ownerId,
      assignedAt: new Date().toISOString()
    } as any);
  }

  /**
   * Create a task for a contact
   */
  async createTask(options: {
    contactId: string;
    subject: string;
    body?: string;
    dueDate?: Date;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    ownerId?: string;
    type?: string;
  }): Promise<any> {
    const url = `${this.baseUrl}/objects/tasks`;
    
    const payload = {
      properties: {
        hs_task_subject: options.subject,
        hs_task_body: options.body || '',
        hs_task_priority: options.priority || 'MEDIUM',
        hs_task_status: 'NOT_STARTED',
        hs_task_type: options.type || 'TODO',
        hubspot_owner_id: options.ownerId,
        hs_timestamp: options.dueDate ? options.dueDate.getTime() : Date.now()
      },
      associations: [
        {
          to: { id: options.contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 204 }]
        }
      ]
    };

    const response = await this.makeRequest(url, 'POST', payload);
    return response;
  }

  /**
   * Search for contacts by email to find duplicates
   */
  async searchContactsByEmail(email: string): Promise<HubSpotContact[]> {
    const url = `${this.baseUrl}/objects/contacts/search`;
    
    const payload = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email.toLowerCase()
        }]
      }],
      properties: ['email', 'firstname', 'lastname', 'company', 'phone', 'createdate']
    };

    const response = await this.makeRequest(url, 'POST', payload);
    return response.results || [];
  }

  /**
   * Get or create company by domain
   */
  async getOrCreateCompany(companyName: string, domain?: string): Promise<any> {
    if (domain) {
      // Try to find existing company by domain
      const searchUrl = `${this.baseUrl}/objects/companies/search`;
      const searchPayload = {
        filterGroups: [{
          filters: [{
            propertyName: 'domain',
            operator: 'EQ',
            value: domain
          }]
        }]
      };

      const searchResponse = await this.makeRequest(searchUrl, 'POST', searchPayload);
      if (searchResponse.results && searchResponse.results.length > 0) {
        return searchResponse.results[0];
      }
    }

    // Create new company
    const createUrl = `${this.baseUrl}/objects/companies`;
    const createPayload = {
      properties: {
        name: companyName,
        domain: domain || ''
      }
    };

    const response = await this.makeRequest(createUrl, 'POST', createPayload);
    return response;
  }

  /**
   * Associate contact with company
   */
  async associateContactWithCompany(contactId: string, companyId: string): Promise<void> {
    const url = `${this.baseUrl}/objects/contacts/${contactId}/associations/company/${companyId}/1`;
    await this.makeRequest(url, 'PUT');
  }

  /**
   * Transform standardized Contact to HubSpot properties
   */
  private transformToHubSpotProperties(contact: Partial<Contact>): Record<string, any> {
    const properties: Record<string, any> = {};

    // Basic fields
    if (contact.email) properties.email = contact.email;
    if (contact.firstName) properties.firstname = contact.firstName;
    if (contact.lastName) properties.lastname = contact.lastName;
    if (contact.phone) properties.phone = contact.phone;
    if (contact.company) properties.company = contact.company;
    if (contact.jobTitle) properties.jobtitle = contact.jobTitle;

    // Lead scoring and grading
    if (contact.leadScore !== undefined) properties.hs_lead_score = contact.leadScore;
    if (contact.status) properties.lifecyclestage = this.mapStatusToLifecycleStage(contact.status);

    // Source and UTM data
    if (contact.source) {
      properties.hs_analytics_source = contact.source;
      properties.hs_latest_source = contact.source;
    }

    if (contact.utm) {
      if (contact.utm.source) properties.utm_source = contact.utm.source;
      if (contact.utm.medium) properties.utm_medium = contact.utm.medium;
      if (contact.utm.campaign) properties.utm_campaign = contact.utm.campaign;
      if (contact.utm.term) properties.utm_term = contact.utm.term;
      if (contact.utm.content) properties.utm_content = contact.utm.content;
    }

    // Assignment
    if (contact.assignedTo) properties.hubspot_owner_id = contact.assignedTo;

    // Custom properties for additional data
    if (contact.leadGrade) properties.lead_grade = contact.leadGrade;
    if (contact.seniority) properties.seniority_level = contact.seniority;
    if (contact.industry) properties.industry = contact.industry;

    // Consent tracking
    if (contact.consent) {
      properties.hs_email_optout = !contact.consent.email;
      if (contact.consent.timestamp) {
        properties.consent_timestamp = contact.consent.timestamp;
      }
    }

    return properties;
  }

  /**
   * Transform HubSpot contact to standardized Contact format
   */
  transformFromHubSpot(hubspotContact: HubSpotContact): Contact {
    const props = hubspotContact.properties;

    // Extract domain from email for company matching
    // const emailDomain = props.email ? props.email.split('@')[1] : undefined;

    return {
      id: hubspotContact.id,
      email: props.email,
      firstName: props.firstname,
      lastName: props.lastname,
      phone: props.phone,
      company: props.company,
      jobTitle: props.jobtitle,
      seniority: this.mapSeniorityFromTitle(props.jobtitle),
      industry: props.industry,
      source: props.hs_analytics_source || props.hs_latest_source || 'direct',
      originalSource: props.hs_analytics_source_data_1,
      utm: {
        source: props.utm_source,
        medium: props.utm_medium,
        campaign: props.utm_campaign,
        term: props.utm_term,
        content: props.utm_content,
        landingPage: props.hs_analytics_source_data_2
      },
      leadScore: parseInt(props.hs_lead_score) || 0,
      leadGrade: props.lead_grade || this.calculateGradeFromScore(props.hs_lead_score),
      status: this.mapLifecycleStageToStatus(props.lifecyclestage),
      assignedTo: props.hubspot_owner_id,
      consent: {
        email: !props.hs_email_optout,
        timestamp: props.consent_timestamp || hubspotContact.createdAt,
        source: 'hubspot_import',
        gdprLawfulBasis: 'legitimate_interests'
      },
      createdAt: hubspotContact.createdAt,
      updatedAt: hubspotContact.updatedAt,
      metadata: {
        hubspotContactId: hubspotContact.id,
        hubspotCompanyId: props.associatedcompanyid,
        originalSource: props.hs_analytics_source,
        firstConversion: props.first_conversion_event_name,
        firstConversionDate: props.first_conversion_date
      }
    } as Contact;
  }

  /**
   * Map status to HubSpot lifecycle stage
   */
  private mapStatusToLifecycleStage(status: string): string {
    const stageMap: Record<string, string> = {
      'new': 'lead',
      'marketing_qualified': 'marketingqualifiedlead',
      'sales_accepted': 'salesqualifiedlead',
      'sales_qualified': 'salesqualifiedlead',
      'opportunity': 'opportunity',
      'customer': 'customer',
      'evangelist': 'evangelist',
      'unqualified': 'other'
    };
    return stageMap[status] || 'other';
  }

  /**
   * Map HubSpot lifecycle stage to standardized status
   */
  private mapLifecycleStageToStatus(lifecycleStage: string): string {
    const statusMap: Record<string, string> = {
      'subscriber': 'new',
      'lead': 'new',
      'marketingqualifiedlead': 'marketing_qualified',
      'salesqualifiedlead': 'sales_qualified',
      'opportunity': 'opportunity',
      'customer': 'customer',
      'evangelist': 'evangelist',
      'other': 'unqualified'
    };
    return statusMap[lifecycleStage] || 'new';
  }

  /**
   * Map job title to seniority level
   */
  private mapSeniorityFromTitle(jobTitle: string): string {
    if (!jobTitle) return 'individual_contributor';
    
    const title = jobTitle.toLowerCase();
    if (title.includes('ceo') || title.includes('cto') || title.includes('cfo') || title.includes('chief')) return 'c_level';
    if (title.includes('vp') || title.includes('vice president')) return 'vp';
    if (title.includes('director')) return 'director';
    if (title.includes('manager')) return 'manager';
    if (title.includes('owner') || title.includes('founder')) return 'owner';
    
    return 'individual_contributor';
  }

  /**
   * Calculate grade from lead score
   */
  private calculateGradeFromScore(score: string | number): string {
    const numScore = typeof score === 'string' ? parseInt(score) : score;
    if (numScore >= 90) return 'A+';
    if (numScore >= 80) return 'A';
    if (numScore >= 70) return 'B+';
    if (numScore >= 60) return 'B';
    if (numScore >= 50) return 'C+';
    if (numScore >= 40) return 'C';
    if (numScore >= 30) return 'D';
    return 'F';
  }

  /**
   * Make authenticated request to HubSpot API
   */
  private async makeRequest(url: string, method: string = 'GET', data?: any): Promise<any> {
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText} - ${error}`);
    }

    return await response.json();
  }

  /**
   * Test the connection to HubSpot
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/objects/contacts?limit=1`);
      return !!response;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create HubSpot client from environment variables
 */
export function createHubSpotClient(): HubSpotClient {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('HubSpot configuration missing: HUBSPOT_ACCESS_TOKEN is required');
  }

  return new HubSpotClient({
    accessToken
  });
}