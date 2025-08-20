/**
 * Google Analytics 4 Integration for Lead Lifecycle Management
 * 
 * Handles fetching user behavior, conversion events, and attribution data
 */

import { Contact } from '../types';

export interface GA4Config {
  propertyId: string;
  serviceAccountCredentials?: any;
  measurementId?: string;
  apiSecret?: string;
}

export interface GA4Dimension {
  name: string;
  dimensionExpression?: {
    concatenate?: {
      dimensionNames: string[];
      delimiter?: string;
    };
  };
}

export interface GA4Metric {
  name: string;
  expression?: string;
}

export interface GA4DateRange {
  startDate: string;
  endDate: string;
}

export interface GA4ReportRequest {
  property: string;
  dateRanges: GA4DateRange[];
  dimensions: GA4Dimension[];
  metrics: GA4Metric[];
  dimensionFilter?: any;
  metricFilter?: any;
  orderBys?: any[];
  limit?: number;
  offset?: number;
}

export interface GA4ReportResponse {
  dimensionHeaders: Array<{ name: string }>;
  metricHeaders: Array<{ name: string; type: string }>;
  rows: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  totals?: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  maximums?: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  minimums?: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  rowCount: number;
}

export class GA4Client {
  private config: GA4Config;
  private baseUrl: string;
  private accessToken?: string;

  constructor(config: GA4Config) {
    this.config = config;
    this.baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
  }

  /**
   * Initialize client with authentication
   */
  async initialize(): Promise<void> {
    if (this.config.serviceAccountCredentials) {
      this.accessToken = await this.getServiceAccountToken();
    }
  }

  /**
   * Fetch user acquisition data for lead attribution
   */
  async fetchUserAcquisition(options: {
    startDate: string;
    endDate: string;
    dimensions?: string[];
    filters?: any;
    limit?: number;
  }): Promise<GA4ReportResponse> {
    const request: GA4ReportRequest = {
      property: `properties/${this.config.propertyId}`,
      dateRanges: [{
        startDate: options.startDate,
        endDate: options.endDate
      }],
      dimensions: (options.dimensions || [
        'sessionSource',
        'sessionMedium',
        'sessionCampaignName',
        'firstUserSource',
        'firstUserMedium',
        'firstUserCampaignName',
        'deviceCategory',
        'country',
        'landingPage'
      ]).map(name => ({ name })),
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
        { name: 'totalRevenue' }
      ],
      limit: options.limit || 1000
    };

    if (options.filters) {
      request.dimensionFilter = options.filters;
    }

    return this.runReport(request);
  }

  /**
   * Fetch conversion events data
   */
  async fetchConversions(options: {
    startDate: string;
    endDate: string;
    conversionEvents?: string[];
    dimensions?: string[];
    limit?: number;
  }): Promise<GA4ReportResponse> {
    const request: GA4ReportRequest = {
      property: `properties/${this.config.propertyId}`,
      dateRanges: [{
        startDate: options.startDate,
        endDate: options.endDate
      }],
      dimensions: (options.dimensions || [
        'eventName',
        'sessionSource',
        'sessionMedium',
        'sessionCampaignName',
        'landingPage',
        'country',
        'deviceCategory'
      ]).map(name => ({ name })),
      metrics: [
        { name: 'eventCount' },
        { name: 'conversions' },
        { name: 'totalRevenue' }
      ],
      limit: options.limit || 1000
    };

    // Filter for specific conversion events if provided
    if (options.conversionEvents && options.conversionEvents.length > 0) {
      request.dimensionFilter = {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: options.conversionEvents
          }
        }
      };
    }

    return this.runReport(request);
  }

  /**
   * Fetch user behavior flow data
   */
  async fetchUserFlow(options: {
    startDate: string;
    endDate: string;
    userId?: string;
    sessionId?: string;
    limit?: number;
  }): Promise<GA4ReportResponse> {
    const request: GA4ReportRequest = {
      property: `properties/${this.config.propertyId}`,
      dateRanges: [{
        startDate: options.startDate,
        endDate: options.endDate
      }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
        { name: 'eventName' },
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
        { name: 'timestamp' }
      ],
      metrics: [
        { name: 'eventCount' },
        { name: 'userEngagementDuration' },
        { name: 'screenPageViews' }
      ],
      orderBys: [{
        dimension: { dimensionName: 'timestamp' },
        desc: false
      }],
      limit: options.limit || 500
    };

    // Add user/session filter if provided
    if (options.userId || options.sessionId) {
      const filters = [];
      if (options.userId) {
        filters.push({
          fieldName: 'customUser:user_id',
          stringFilter: { value: options.userId }
        });
      }
      if (options.sessionId) {
        filters.push({
          fieldName: 'ga_session_id',
          stringFilter: { value: options.sessionId }
        });
      }

      request.dimensionFilter = {
        andGroup: { expressions: filters.map(filter => ({ filter })) }
      };
    }

    return this.runReport(request);
  }

  /**
   * Fetch attribution data for multi-touch analysis
   */
  async fetchAttributionData(options: {
    startDate: string;
    endDate: string;
    conversionEvent: string;
    attributionModel?: 'first_click' | 'last_click' | 'linear' | 'time_decay';
    limit?: number;
  }): Promise<GA4ReportResponse> {
    const request: GA4ReportRequest = {
      property: `properties/${this.config.propertyId}`,
      dateRanges: [{
        startDate: options.startDate,
        endDate: options.endDate
      }],
      dimensions: [
        { name: 'firstUserSource' },
        { name: 'firstUserMedium' },
        { name: 'firstUserCampaignName' },
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
        { name: 'sessionCampaignName' },
        { name: 'attributionModel' }
      ],
      metrics: [
        { name: 'conversions' },
        { name: 'totalRevenue' },
        { name: 'purchaseRevenue' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: options.conversionEvent }
        }
      },
      limit: options.limit || 1000
    };

    return this.runReport(request);
  }

  /**
   * Transform GA4 user data to Contact format for lead scoring
   */
  enrichContactWithGA4Data(contact: Partial<Contact>, ga4Data: {
    sessions: number;
    pageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionEvents: Array<{
      eventName: string;
      timestamp: string;
      value?: number;
    }>;
    trafficSource: {
      source: string;
      medium: string;
      campaign?: string;
      content?: string;
      term?: string;
    };
    geography: {
      country?: string;
      region?: string;
      city?: string;
    };
    technology: {
      deviceCategory?: string;
      browser?: string;
      operatingSystem?: string;
    };
    behavior: {
      engagementScore: number;
      timeOnSite: number;
      pagesPerSession: number;
    };
  }): Partial<Contact> {
    // Calculate lead score based on GA4 engagement metrics
    const behaviorScore = this.calculateBehaviorScore(ga4Data);
    const engagementGrade = this.calculateEngagementGrade(ga4Data);

    return {
      ...contact,
      leadScore: (contact.leadScore || 0) + behaviorScore,
      leadGrade: engagementGrade,
      source: ga4Data.trafficSource.source,
      utm: {
        source: ga4Data.trafficSource.source,
        medium: ga4Data.trafficSource.medium,
        campaign: ga4Data.trafficSource.campaign,
        content: ga4Data.trafficSource.content,
        term: ga4Data.trafficSource.term
      },
      metadata: {
        ...contact.metadata,
        ga4Data: {
          sessions: ga4Data.sessions,
          pageViews: ga4Data.pageViews,
          averageSessionDuration: ga4Data.averageSessionDuration,
          bounceRate: ga4Data.bounceRate,
          engagementScore: ga4Data.behavior.engagementScore,
          lastConversionEvent: ga4Data.conversionEvents[0]?.eventName,
          lastConversionDate: ga4Data.conversionEvents[0]?.timestamp,
          deviceCategory: ga4Data.technology.deviceCategory,
          geography: ga4Data.geography
        }
      }
    };
  }

  /**
   * Calculate behavior score based on engagement metrics
   */
  private calculateBehaviorScore(data: any): number {
    let score = 0;

    // Session engagement (0-30 points)
    score += Math.min(data.sessions * 2, 30);

    // Page depth (0-25 points)
    const pagesPerSession = data.pageViews / Math.max(data.sessions, 1);
    score += Math.min(pagesPerSession * 5, 25);

    // Time on site (0-20 points)
    const avgDurationMinutes = data.averageSessionDuration / 60;
    if (avgDurationMinutes > 5) score += 20;
    else if (avgDurationMinutes > 2) score += 15;
    else if (avgDurationMinutes > 1) score += 10;
    else if (avgDurationMinutes > 0.5) score += 5;

    // Bounce rate penalty (0 to -15 points)
    if (data.bounceRate > 0.8) score -= 15;
    else if (data.bounceRate > 0.6) score -= 10;
    else if (data.bounceRate > 0.4) score -= 5;

    // Conversion events bonus (0-25 points)
    score += Math.min(data.conversionEvents?.length * 10, 25);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate engagement grade
   */
  private calculateEngagementGrade(data: any): string {
    const score = this.calculateBehaviorScore(data);
    
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D';
    return 'F';
  }

  /**
   * Run a GA4 report request
   */
  private async runReport(request: GA4ReportRequest): Promise<GA4ReportResponse> {
    const url = `${this.baseUrl}/${request.property}:runReport`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GA4 API error: ${response.status} ${response.statusText} - ${error}`);
    }

    return await response.json() as GA4ReportResponse;
  }

  /**
   * Get service account access token
   */
  private async getServiceAccountToken(): Promise<string> {
    if (!this.config.serviceAccountCredentials) {
      throw new Error('Service account credentials not provided');
    }

    // This would typically use googleapis JWT authentication
    // For now, return placeholder - in real implementation would use:
    // - google-auth-library or googleapis package
    // - JWT token generation with appropriate scopes
    
    throw new Error('Service account authentication not implemented - please provide access token');
  }

  /**
   * Test the connection to GA4
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.accessToken) {
        await this.initialize();
      }

      const response = await this.runReport({
        property: `properties/${this.config.propertyId}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        limit: 1
      });

      return !!response.rows;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create GA4 client from environment variables
 */
export function createGA4Client(): GA4Client {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const serviceAccountPath = process.env.GA4_SERVICE_ACCOUNT_PATH;
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!propertyId) {
    throw new Error('GA4 configuration missing: GA4_PROPERTY_ID is required');
  }

  let serviceAccountCredentials;
  if (serviceAccountPath) {
    try {
      serviceAccountCredentials = require(serviceAccountPath);
    } catch (error) {
      console.warn('Failed to load GA4 service account credentials:', error);
    }
  }

  return new GA4Client({
    propertyId,
    serviceAccountCredentials,
    measurementId,
    apiSecret
  });
}