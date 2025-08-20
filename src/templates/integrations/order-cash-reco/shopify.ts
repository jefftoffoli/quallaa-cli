/**
 * Shopify Integration for Order-to-Cash Reconciliation
 * 
 * Handles fetching orders, refunds, and transaction data from Shopify Admin API
 */

import { Order } from '../types';

export interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
  apiVersion?: string;
}

export interface ShopifyOrdersResponse {
  orders: any[];
  nextPageInfo?: string;
  hasMore: boolean;
}

export class ShopifyClient {
  private config: ShopifyConfig;
  private baseUrl: string;

  constructor(config: ShopifyConfig) {
    this.config = {
      ...config,
      apiVersion: config.apiVersion || '2024-01'
    };
    this.baseUrl = `https://${config.shopDomain}.myshopify.com/admin/api/${this.config.apiVersion}`;
  }

  /**
   * Fetch orders from Shopify with optional date range and status filters
   */
  async fetchOrders(options: {
    createdAtMin?: string;
    createdAtMax?: string;
    updatedAtMin?: string;
    updatedAtMax?: string;
    status?: 'open' | 'closed' | 'cancelled' | 'any';
    financialStatus?: 'authorized' | 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'voided' | 'partially_refunded' | 'any';
    limit?: number;
    pageInfo?: string;
  } = {}): Promise<ShopifyOrdersResponse> {
    const params = new URLSearchParams();
    
    // Add date filters
    if (options.createdAtMin) params.append('created_at_min', options.createdAtMin);
    if (options.createdAtMax) params.append('created_at_max', options.createdAtMax);
    if (options.updatedAtMin) params.append('updated_at_min', options.updatedAtMin);
    if (options.updatedAtMax) params.append('updated_at_max', options.updatedAtMax);
    
    // Add status filters
    if (options.status) params.append('status', options.status);
    if (options.financialStatus) params.append('financial_status', options.financialStatus);
    
    // Pagination
    params.append('limit', String(options.limit || 250));
    if (options.pageInfo) params.append('page_info', options.pageInfo);

    const url = `${this.baseUrl}/orders.json?${params}`;

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': this.config.accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { orders: any[] };
    
    // Check for pagination info in Link header
    const linkHeader = response.headers.get('link');
    const nextPageInfo = this.extractPageInfo(linkHeader, 'next');
    
    return {
      orders: data.orders || [],
      nextPageInfo,
      hasMore: !!nextPageInfo
    };
  }

  /**
   * Fetch transactions for a specific order
   */
  async fetchOrderTransactions(orderId: string): Promise<any[]> {
    const url = `${this.baseUrl}/orders/${orderId}/transactions.json`;

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': this.config.accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { transactions: any[] };
    return data.transactions || [];
  }

  /**
   * Transform Shopify order to standardized Order format
   */
  transformOrder(shopifyOrder: any): Order {
    return {
      id: shopifyOrder.id.toString(),
      orderNumber: shopifyOrder.name || shopifyOrder.order_number?.toString(),
      customerId: shopifyOrder.customer?.id?.toString(),
      customerEmail: shopifyOrder.email,
      status: this.mapOrderStatus(shopifyOrder.fulfillment_status, shopifyOrder.financial_status),
      financialStatus: this.mapFinancialStatus(shopifyOrder.financial_status),
      fulfillmentStatus: this.mapFulfillmentStatus(shopifyOrder.fulfillment_status),
      totalAmount: this.parseAmount(shopifyOrder.total_price),
      subtotalAmount: this.parseAmount(shopifyOrder.subtotal_price),
      taxAmount: this.parseAmount(shopifyOrder.total_tax),
      shippingAmount: this.parseAmount(shopifyOrder.total_shipping_price_set?.shop_money?.amount || 0),
      discountAmount: this.parseAmount(shopifyOrder.total_discounts),
      refundedAmount: this.calculateRefundedAmount(shopifyOrder.refunds || []),
      currency: shopifyOrder.currency,
      items: this.transformLineItems(shopifyOrder.line_items || []),
      transactions: [], // Will be populated separately via fetchOrderTransactions
      shippingAddress: shopifyOrder.shipping_address ? this.transformAddress(shopifyOrder.shipping_address) : undefined,
      billingAddress: shopifyOrder.billing_address ? this.transformAddress(shopifyOrder.billing_address) : undefined,
      tags: shopifyOrder.tags ? shopifyOrder.tags.split(',').map((tag: string) => tag.trim()) : [],
      source: this.mapOrderSource(shopifyOrder.source_name),
      channel: shopifyOrder.source_name,
      createdAt: shopifyOrder.created_at,
      updatedAt: shopifyOrder.updated_at,
      cancelledAt: shopifyOrder.cancelled_at,
      closedAt: shopifyOrder.closed_at,
      metadata: {
        shopifyOrderId: shopifyOrder.id,
        shopifyOrderNumber: shopifyOrder.order_number,
        gateway: shopifyOrder.gateway,
        reference: shopifyOrder.reference,
        sourceIdentifier: shopifyOrder.source_identifier,
        sourceUrl: shopifyOrder.source_url
      }
    };
  }

  /**
   * Transform Shopify line items to standardized format
   */
  private transformLineItems(lineItems: any[]): any[] {
    return lineItems.map(item => ({
      productId: item.product_id?.toString(),
      variantId: item.variant_id?.toString(),
      productName: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: this.parseAmount(item.price),
      totalPrice: this.parseAmount(item.price) * item.quantity,
      taxAmount: this.parseAmount(item.total_tax || 0),
      discountAmount: this.parseAmount(item.total_discount || 0)
    }));
  }

  /**
   * Transform Shopify address to standardized format
   */
  private transformAddress(address: any): any {
    return {
      firstName: address.first_name,
      lastName: address.last_name,
      company: address.company,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      province: address.province,
      provinceCode: address.province_code,
      country: address.country,
      countryCode: address.country_code,
      zip: address.zip,
      phone: address.phone
    };
  }

  /**
   * Map Shopify status to standardized status
   */
  private mapOrderStatus(fulfillmentStatus: string, financialStatus: string): string {
    if (financialStatus === 'voided') return 'cancelled';
    if (financialStatus === 'refunded') return 'refunded';
    if (financialStatus === 'partially_refunded') return 'partially_refunded';
    if (fulfillmentStatus === 'fulfilled') return 'delivered';
    if (fulfillmentStatus === 'partial') return 'shipped';
    if (financialStatus === 'paid') return 'paid';
    if (financialStatus === 'authorized') return 'authorized';
    return 'pending';
  }

  private mapFinancialStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'authorized': 'authorized', 
      'paid': 'paid',
      'partially_paid': 'partially_paid',
      'refunded': 'refunded',
      'voided': 'voided',
      'partially_refunded': 'partially_refunded'
    };
    return statusMap[status] || 'pending';
  }

  private mapFulfillmentStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'unfulfilled': 'unfulfilled',
      'partial': 'partially_fulfilled',
      'fulfilled': 'fulfilled',
      'restocked': 'restocked'
    };
    return statusMap[status] || 'unfulfilled';
  }

  private mapOrderSource(sourceName: string): string {
    const sourceMap: Record<string, string> = {
      'web': 'web',
      'pos': 'pos', 
      'mobile_app': 'mobile_app',
      'shopify_draft_order': 'manual',
      'instagram': 'marketplace',
      'facebook': 'marketplace',
      'buy_button': 'web'
    };
    return sourceMap[sourceName] || 'web';
  }

  /**
   * Parse amount from Shopify (string) to cents (integer)
   */
  private parseAmount(amount: string | number): number {
    if (typeof amount === 'number') {
      return Math.round(amount * 100);
    }
    return Math.round(parseFloat(amount || '0') * 100);
  }

  /**
   * Calculate total refunded amount from refunds array
   */
  private calculateRefundedAmount(refunds: any[]): number {
    return refunds.reduce((total, refund) => {
      return total + this.parseAmount(refund.amount || 0);
    }, 0);
  }

  /**
   * Extract page info from Link header for pagination
   */
  private extractPageInfo(linkHeader: string | null, rel: 'next' | 'previous'): string | undefined {
    if (!linkHeader) return undefined;
    
    const links = linkHeader.split(',');
    for (const link of links) {
      const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
      if (match && match[2] === rel) {
        const url = new URL(match[1]);
        return url.searchParams.get('page_info') || undefined;
      }
    }
    return undefined;
  }

  /**
   * Test the connection to Shopify
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': this.config.accessToken,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create Shopify client from environment variables
 */
export function createShopifyClient(): ShopifyClient {
  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION;

  if (!shopDomain || !accessToken) {
    throw new Error('Shopify configuration missing: SHOPIFY_SHOP_DOMAIN and SHOPIFY_ACCESS_TOKEN are required');
  }

  return new ShopifyClient({
    shopDomain,
    accessToken,
    apiVersion
  });
}