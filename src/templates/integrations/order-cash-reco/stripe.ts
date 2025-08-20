/**
 * Stripe Integration for Order-to-Cash Reconciliation
 * 
 * Handles fetching payouts, balance transactions, and fee data from Stripe API
 */

import { Payout } from '../types';

export interface StripeConfig {
  secretKey: string;
  apiVersion?: string;
  maxRetries?: number;
}

export interface StripeListResponse<T> {
  data: T[];
  has_more: boolean;
  next_page?: string;
}

export class StripeClient {
  private config: StripeConfig;
  private baseUrl: string;

  constructor(config: StripeConfig) {
    this.config = {
      maxRetries: 3,
      apiVersion: '2023-10-16',
      ...config
    };
    this.baseUrl = 'https://api.stripe.com/v1';
  }

  /**
   * Fetch payouts from Stripe with optional date range filters
   */
  async fetchPayouts(options: {
    created?: {
      gte?: number;
      lte?: number;
    };
    arrivalDate?: {
      gte?: number;
      lte?: number;
    };
    status?: 'pending' | 'paid' | 'failed' | 'canceled' | 'in_transit';
    limit?: number;
    startingAfter?: string;
  } = {}): Promise<StripeListResponse<any>> {
    const params = new URLSearchParams();

    // Date filters
    if (options.created?.gte) params.append('created[gte]', options.created.gte.toString());
    if (options.created?.lte) params.append('created[lte]', options.created.lte.toString());
    if (options.arrivalDate?.gte) params.append('arrival_date[gte]', options.arrivalDate.gte.toString());
    if (options.arrivalDate?.lte) params.append('arrival_date[lte]', options.arrivalDate.lte.toString());

    // Status filter
    if (options.status) params.append('status', options.status);

    // Pagination
    params.append('limit', String(options.limit || 100));
    if (options.startingAfter) params.append('starting_after', options.startingAfter);

    const url = `${this.baseUrl}/payouts?${params}`;

    const response = await this.makeRequest(url, 'GET');
    return response;
  }

  /**
   * Fetch balance transactions for a specific payout
   */
  async fetchPayoutTransactions(payoutId: string): Promise<StripeListResponse<any>> {
    const params = new URLSearchParams();
    params.append('payout', payoutId);
    params.append('limit', '100');

    const url = `${this.baseUrl}/balance_transactions?${params}`;

    const response = await this.makeRequest(url, 'GET');
    return response;
  }

  /**
   * Fetch all balance transactions with date range
   */
  async fetchBalanceTransactions(options: {
    created?: {
      gte?: number;
      lte?: number;
    };
    availableOn?: {
      gte?: number;
      lte?: number;
    };
    type?: string[];
    limit?: number;
    startingAfter?: string;
  } = {}): Promise<StripeListResponse<any>> {
    const params = new URLSearchParams();

    // Date filters
    if (options.created?.gte) params.append('created[gte]', options.created.gte.toString());
    if (options.created?.lte) params.append('created[lte]', options.created.lte.toString());
    if (options.availableOn?.gte) params.append('available_on[gte]', options.availableOn.gte.toString());
    if (options.availableOn?.lte) params.append('available_on[lte]', options.availableOn.lte.toString());

    // Type filter
    if (options.type) {
      options.type.forEach(type => params.append('type[]', type));
    }

    // Pagination
    params.append('limit', String(options.limit || 100));
    if (options.startingAfter) params.append('starting_after', options.startingAfter);

    const url = `${this.baseUrl}/balance_transactions?${params}`;

    const response = await this.makeRequest(url, 'GET');
    return response;
  }

  /**
   * Fetch a specific charge by ID
   */
  async fetchCharge(chargeId: string): Promise<any> {
    const url = `${this.baseUrl}/charges/${chargeId}`;
    return await this.makeRequest(url, 'GET');
  }

  /**
   * Transform Stripe payout to standardized Payout format
   */
  transformPayout(stripePayout: any, transactions: any[] = []): Payout {
    const transformedTransactions = transactions.map(txn => this.transformBalanceTransaction(txn));

    return {
      id: stripePayout.id,
      amount: stripePayout.amount,
      currency: stripePayout.currency.toUpperCase(),
      status: this.mapPayoutStatus(stripePayout.status),
      type: stripePayout.type,
      method: stripePayout.method,
      bankAccount: stripePayout.destination ? {
        id: stripePayout.destination,
        last4: stripePayout.destination_details?.last4 || '',
        bankName: stripePayout.destination_details?.bank_name || '',
        country: stripePayout.destination_details?.country || '',
        currency: stripePayout.currency.toUpperCase()
      } : undefined,
      balanceTransactions: transformedTransactions,
      feeDetails: this.calculateFeeDetails(transformedTransactions),
      summary: this.calculatePayoutSummary(transformedTransactions),
      arrivalDate: new Date(stripePayout.arrival_date * 1000).toISOString().split('T')[0],
      createdAt: new Date(stripePayout.created * 1000).toISOString(),
      updatedAt: new Date(stripePayout.created * 1000).toISOString(),
      metadata: {
        stripePayoutId: stripePayout.id,
        description: stripePayout.description,
        failureCode: stripePayout.failure_code,
        failureMessage: stripePayout.failure_message
      }
    };
  }

  /**
   * Transform Stripe balance transaction to standardized format
   */
  private transformBalanceTransaction(transaction: any): any {
    // Extract order information from description or metadata
    const orderInfo = this.extractOrderInfo(transaction);

    return {
      id: transaction.id,
      amount: transaction.amount,
      fee: transaction.fee,
      net: transaction.net,
      type: transaction.type,
      currency: transaction.currency.toUpperCase(),
      description: transaction.description,
      sourceId: transaction.source,
      sourceType: this.mapSourceType(transaction.type),
      orderId: orderInfo.orderId,
      customerEmail: orderInfo.customerEmail,
      reportingCategory: transaction.reporting_category,
      exchangeRate: transaction.exchange_rate,
      createdAt: new Date(transaction.created * 1000).toISOString(),
      availableOn: new Date(transaction.available_on * 1000).toISOString()
    };
  }

  /**
   * Extract order information from transaction description or metadata
   */
  private extractOrderInfo(transaction: any): { orderId?: string; customerEmail?: string } {
    // Try to extract order ID from description
    // Common patterns: "Payment for order #1234", "Order 1234", etc.
    const description = transaction.description || '';
    const orderMatch = description.match(/(?:order|#)\s*(\w+)/i);
    
    return {
      orderId: orderMatch ? orderMatch[1] : undefined,
      customerEmail: undefined // Would need to be enriched from charge data
    };
  }

  /**
   * Map Stripe payout status to standardized status
   */
  private mapPayoutStatus(status: string): 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled' {
    const statusMap: Record<string, any> = {
      'pending': 'pending',
      'in_transit': 'in_transit', 
      'paid': 'paid',
      'failed': 'failed',
      'canceled': 'cancelled'
    };
    return statusMap[status] || 'pending';
  }

  /**
   * Map transaction type to source type
   */
  private mapSourceType(type: string): string {
    const typeMap: Record<string, string> = {
      'charge': 'charge',
      'refund': 'refund',
      'adjustment': 'adjustment',
      'application_fee': 'fee',
      'application_fee_refund': 'fee_refund',
      'transfer': 'transfer',
      'payout': 'payout',
      'payout_cancel': 'payout_cancel',
      'stripe_fee': 'fee',
      'network_cost': 'fee'
    };
    return typeMap[type] || type;
  }

  /**
   * Calculate fee breakdown from balance transactions
   */
  private calculateFeeDetails(transactions: any[]): any[] {
    const fees: Record<string, { amount: number; description: string }> = {};

    transactions.forEach(txn => {
      if (txn.fee > 0) {
        const feeType = txn.type === 'charge' ? 'stripe_fee' : 
                       txn.type === 'refund' ? 'refund_fee' :
                       'processing_fee';
        
        if (!fees[feeType]) {
          fees[feeType] = { amount: 0, description: this.getFeeDescription(feeType) };
        }
        fees[feeType].amount += txn.fee;
      }
    });

    return Object.entries(fees).map(([type, data]) => ({
      type,
      amount: data.amount,
      currency: 'USD', // Assuming USD, should be dynamic
      description: data.description
    }));
  }

  private getFeeDescription(feeType: string): string {
    const descriptions: Record<string, string> = {
      'stripe_fee': 'Stripe processing fees',
      'refund_fee': 'Refund processing fees',
      'processing_fee': 'Payment processing fees'
    };
    return descriptions[feeType] || 'Processing fee';
  }

  /**
   * Calculate payout summary from balance transactions
   */
  private calculatePayoutSummary(transactions: any[]): any {
    const summary = {
      chargeGross: 0,
      chargeFees: 0,
      chargeCount: 0,
      refundGross: 0,
      refundFees: 0,
      refundCount: 0,
      adjustmentGross: 0,
      adjustmentFees: 0,
      adjustmentCount: 0,
      netTotal: 0
    };

    transactions.forEach(txn => {
      if (txn.type === 'charge') {
        summary.chargeGross += txn.amount;
        summary.chargeFees += txn.fee;
        summary.chargeCount++;
      } else if (txn.type === 'refund') {
        summary.refundGross += Math.abs(txn.amount);
        summary.refundFees += txn.fee;
        summary.refundCount++;
      } else if (txn.type === 'adjustment') {
        summary.adjustmentGross += txn.amount;
        summary.adjustmentFees += txn.fee;
        summary.adjustmentCount++;
      }
      summary.netTotal += txn.net;
    });

    return summary;
  }

  /**
   * Make authenticated request to Stripe API
   */
  private async makeRequest(url: string, method: string = 'GET', data?: any): Promise<any> {
    let lastError;
    
    for (let attempt = 0; attempt < (this.config.maxRetries || 3); attempt++) {
      try {
        const options: RequestInit = {
          method,
          headers: {
            'Authorization': `Bearer ${this.config.secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Stripe-Version': this.config.apiVersion || '2023-10-16'
          }
        };

        if (data && method !== 'GET') {
          options.body = new URLSearchParams(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
          const error = await response.json() as any;
          throw new Error(`Stripe API error: ${error.error?.message || response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        
        // Don't retry on authentication or client errors
        if (error instanceof Error && error.message.includes('401')) {
          break;
        }
        
        // Wait before retrying
        if (attempt < (this.config.maxRetries || 3) - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError;
  }

  /**
   * Test the connection to Stripe
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/account`);
      return !!response.id;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create Stripe client from environment variables
 */
export function createStripeClient(): StripeClient {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const apiVersion = process.env.STRIPE_API_VERSION;

  if (!secretKey) {
    throw new Error('Stripe configuration missing: STRIPE_SECRET_KEY is required');
  }

  return new StripeClient({
    secretKey,
    apiVersion
  });
}