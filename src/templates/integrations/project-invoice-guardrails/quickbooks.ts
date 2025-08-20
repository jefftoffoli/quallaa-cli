/**
 * QuickBooks Online Integration for Project Invoice Guardrails
 * 
 * Handles fetching invoices, customers, projects, and items from QuickBooks Online API
 */

export interface QuickBooksConfig {
  accessToken: string;
  refreshToken: string;
  realmId: string; // Company ID
  baseUrl?: string;
  minorVersion?: string;
}

export interface QBOInvoice {
  Id: string;
  SyncToken: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  CustomField?: Array<{
    DefinitionId: string;
    Name: string;
    Type: string;
    StringValue?: string;
  }>;
  DocNumber: string;
  TxnDate: string;
  DueDate: string;
  CurrencyRef: {
    value: string;
    name: string;
  };
  ExchangeRate?: number;
  PrivateNote?: string;
  LinkedTxn?: Array<{
    TxnId: string;
    TxnType: string;
  }>;
  Line: Array<{
    Id?: string;
    LineNum?: number;
    Amount: number;
    DetailType: string;
    SalesItemLineDetail?: {
      ItemRef: {
        value: string;
        name: string;
      };
      UnitPrice?: number;
      Qty?: number;
      TaxCodeRef?: {
        value: string;
      };
      ServiceDate?: string;
      ClassRef?: {
        value: string;
        name: string;
      };
    };
    GroupLineDetail?: {
      GroupItemRef: {
        value: string;
        name: string;
      };
      Qty?: number;
      Line: any[];
    };
  }>;
  TxnTaxDetail?: {
    TxnTaxCodeRef?: {
      value: string;
    };
    TotalTax?: number;
    TaxLine?: Array<{
      Amount: number;
      DetailType: string;
      TaxLineDetail: {
        TaxRateRef: {
          value: string;
        };
        PercentBased: boolean;
        TaxPercent: number;
        NetAmountTaxable: number;
      };
    }>;
  };
  CustomerRef: {
    value: string;
    name: string;
  };
  BillAddr?: {
    Id: string;
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
  ShipAddr?: {
    Id: string;
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
  SalesTermRef?: {
    value: string;
  };
  TotalAmt: number;
  Balance: number;
  HomeTotalAmt: number;
  PrintStatus: string;
  EmailStatus: string;
  BillEmail?: {
    Address: string;
  };
  DeliveryInfo?: {
    DeliveryType: string;
    DeliveryTime: string;
  };
}

export interface QBOCustomer {
  Id: string;
  SyncToken: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  Name: string;
  CompanyName?: string;
  ContactName?: string;
  DisplayName: string;
  PrintOnCheckName: string;
  Active: boolean;
  PrimaryPhone?: {
    FreeFormNumber: string;
  };
  PrimaryEmailAddr?: {
    Address: string;
  };
  WebAddr?: {
    URI: string;
  };
  DefaultTaxCodeRef?: {
    value: string;
  };
  Taxable: boolean;
  BillAddr?: {
    Id: string;
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
  ShipAddr?: {
    Id: string;
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
  PaymentMethodRef?: {
    value: string;
  };
  Balance: number;
  BalanceWithJobs: number;
  CurrencyRef: {
    value: string;
    name: string;
  };
}

export interface QBOItem {
  Id: string;
  SyncToken: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  Name: string;
  Description?: string;
  Active: boolean;
  Type: string;
  UnitPrice?: number;
  IncomeAccountRef?: {
    value: string;
    name: string;
  };
  ExpenseAccountRef?: {
    value: string;
    name: string;
  };
  AssetAccountRef?: {
    value: string;
    name: string;
  };
  TaxClassificationRef?: {
    value: string;
  };
  SalesTaxIncluded?: boolean;
  PurchaseTaxIncluded?: boolean;
  TrackQtyOnHand?: boolean;
  QtyOnHand?: {
    Amount: number;
    AsOfDate: string;
  };
}

export interface QBOClass {
  Id: string;
  SyncToken: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  Name: string;
  SubClass: boolean;
  ParentRef?: {
    value: string;
    name: string;
  };
  FullyQualifiedName: string;
  Active: boolean;
}

export interface QBOQueryResponse<T> {
  QueryResponse: {
    Invoice?: T[];
    Customer?: T[];
    Item?: T[];
    Class?: T[];
    startPosition: number;
    maxResults: number;
    totalCount?: number;
  };
  time: string;
}

export class QuickBooksClient {
  private config: QuickBooksConfig;
  private baseUrl: string;

  constructor(config: QuickBooksConfig) {
    this.config = {
      baseUrl: 'https://sandbox-quickbooks.api.intuit.com',
      minorVersion: '65',
      ...config
    };
    this.baseUrl = `${this.config.baseUrl}/v3/company/${this.config.realmId}`;
  }

  /**
   * Fetch invoices with optional filters
   */
  async fetchInvoices(options: {
    customerId?: string;
    startDate?: string;
    endDate?: string;
    modifiedAfter?: string;
    maxResults?: number;
    startPosition?: number;
  } = {}): Promise<QBOInvoice[]> {
    let query = "SELECT * FROM Invoice";
    const conditions = [];

    if (options.customerId) {
      conditions.push(`CustomerRef = '${options.customerId}'`);
    }

    if (options.startDate) {
      conditions.push(`TxnDate >= '${options.startDate}'`);
    }

    if (options.endDate) {
      conditions.push(`TxnDate <= '${options.endDate}'`);
    }

    if (options.modifiedAfter) {
      conditions.push(`Metadata.LastUpdatedTime >= '${options.modifiedAfter}'`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY TxnDate DESC`;

    if (options.maxResults) {
      query += ` MAXRESULTS ${options.maxResults}`;
    }

    if (options.startPosition) {
      query += ` STARTPOSITION ${options.startPosition}`;
    }

    const response = await this.makeRequest<QBOQueryResponse<QBOInvoice>>(
      `${this.baseUrl}/query?query=${encodeURIComponent(query)}`
    );

    return response.QueryResponse.Invoice || [];
  }

  /**
   * Fetch customers
   */
  async fetchCustomers(options: {
    active?: boolean;
    modifiedAfter?: string;
    maxResults?: number;
  } = {}): Promise<QBOCustomer[]> {
    let query = "SELECT * FROM Customer";
    const conditions = [];

    if (options.active !== undefined) {
      conditions.push(`Active = ${options.active}`);
    }

    if (options.modifiedAfter) {
      conditions.push(`Metadata.LastUpdatedTime >= '${options.modifiedAfter}'`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (options.maxResults) {
      query += ` MAXRESULTS ${options.maxResults}`;
    }

    const response = await this.makeRequest<QBOQueryResponse<QBOCustomer>>(
      `${this.baseUrl}/query?query=${encodeURIComponent(query)}`
    );

    return response.QueryResponse.Customer || [];
  }

  /**
   * Fetch service items (used for time billing)
   */
  async fetchServiceItems(): Promise<QBOItem[]> {
    const query = "SELECT * FROM Item WHERE Type = 'Service'";

    const response = await this.makeRequest<QBOQueryResponse<QBOItem>>(
      `${this.baseUrl}/query?query=${encodeURIComponent(query)}`
    );

    return response.QueryResponse.Item || [];
  }

  /**
   * Fetch classes (often used for projects/departments)
   */
  async fetchClasses(options: {
    active?: boolean;
  } = {}): Promise<QBOClass[]> {
    let query = "SELECT * FROM Class";

    if (options.active !== undefined) {
      query += ` WHERE Active = ${options.active}`;
    }

    const response = await this.makeRequest<QBOQueryResponse<QBOClass>>(
      `${this.baseUrl}/query?query=${encodeURIComponent(query)}`
    );

    return response.QueryResponse.Class || [];
  }

  /**
   * Get a specific invoice
   */
  async getInvoice(invoiceId: string): Promise<QBOInvoice> {
    const response = await this.makeRequest<{
      QueryResponse: { Invoice: QBOInvoice[] };
    }>(`${this.baseUrl}/invoice/${invoiceId}`);

    if (!response.QueryResponse?.Invoice?.[0]) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    return response.QueryResponse.Invoice[0];
  }

  /**
   * Transform QBO invoice to standardized Invoice format
   */
  transformInvoice(qboInvoice: QBOInvoice): any {
    // Extract project information from class or custom fields
    const projectInfo = this.extractProjectInfo(qboInvoice);

    const lineItems = qboInvoice.Line
      .filter(line => line.DetailType === 'SalesItemLineDetail')
      .map((line, index) => ({
        id: line.Id || `qbo_line_${index}`,
        type: this.determineLineItemType(line),
        description: line.SalesItemLineDetail?.ItemRef.name || 'Service',
        quantity: line.SalesItemLineDetail?.Qty || 1,
        unitPrice: line.SalesItemLineDetail?.UnitPrice || line.Amount,
        amount: line.Amount,
        taxAmount: 0, // Would need to calculate from TxnTaxDetail
        serviceDate: line.SalesItemLineDetail?.ServiceDate,
        metadata: {
          qboItemId: line.SalesItemLineDetail?.ItemRef.value,
          qboClassId: line.SalesItemLineDetail?.ClassRef?.value,
          qboClassName: line.SalesItemLineDetail?.ClassRef?.name
        }
      }));

    return {
      id: `qbo_${qboInvoice.Id}`,
      invoiceNumber: qboInvoice.DocNumber,
      projectId: projectInfo.projectId,
      clientId: `qbo_customer_${qboInvoice.CustomerRef.value}`,
      clientName: qboInvoice.CustomerRef.name,
      issueDate: qboInvoice.TxnDate,
      dueDate: qboInvoice.DueDate,
      lineItems,
      subtotal: qboInvoice.TotalAmt - (qboInvoice.TxnTaxDetail?.TotalTax || 0),
      taxAmount: qboInvoice.TxnTaxDetail?.TotalTax || 0,
      discountAmount: 0, // Would need to calculate from discount lines
      total: qboInvoice.TotalAmt,
      currency: qboInvoice.CurrencyRef?.name || 'USD',
      status: this.mapInvoiceStatus(qboInvoice),
      paidAmount: qboInvoice.TotalAmt - qboInvoice.Balance,
      paymentTerms: this.getPaymentTerms(qboInvoice.SalesTermRef?.value),
      notes: qboInvoice.PrivateNote,
      createdAt: qboInvoice.MetaData.CreateTime,
      updatedAt: qboInvoice.MetaData.LastUpdatedTime,
      metadata: {
        sourceSystem: 'quickbooks',
        externalId: qboInvoice.Id,
        syncToken: qboInvoice.SyncToken,
        printStatus: qboInvoice.PrintStatus,
        emailStatus: qboInvoice.EmailStatus,
        balance: qboInvoice.Balance,
        exchangeRate: qboInvoice.ExchangeRate,
        linkedTransactions: qboInvoice.LinkedTxn
      }
    };
  }

  /**
   * Extract project information from QBO invoice
   */
  private extractProjectInfo(invoice: QBOInvoice): { projectId?: string; projectName?: string } {
    // Check custom fields for project information
    const projectField = invoice.CustomField?.find(field => 
      field.Name.toLowerCase().includes('project')
    );

    if (projectField?.StringValue) {
      return {
        projectId: `qbo_project_${projectField.StringValue}`,
        projectName: projectField.StringValue
      };
    }

    // Check class (often used for projects in QBO)
    const classRef = invoice.Line.find(line => 
      line.SalesItemLineDetail?.ClassRef
    )?.SalesItemLineDetail?.ClassRef;

    if (classRef) {
      return {
        projectId: `qbo_class_${classRef.value}`,
        projectName: classRef.name
      };
    }

    return {};
  }

  /**
   * Determine line item type
   */
  private determineLineItemType(line: any): string {
    const itemName = line.SalesItemLineDetail?.ItemRef.name?.toLowerCase() || '';
    
    if (itemName.includes('time') || itemName.includes('hour') || itemName.includes('labor')) {
      return 'time';
    }
    if (itemName.includes('expense') || itemName.includes('cost')) {
      return 'expense';
    }
    if (itemName.includes('milestone') || itemName.includes('phase')) {
      return 'milestone';
    }
    if (itemName.includes('fixed') || itemName.includes('fee')) {
      return 'fixed_fee';
    }

    return 'time'; // Default assumption for services
  }

  /**
   * Map QBO status to standardized invoice status
   */
  private mapInvoiceStatus(invoice: QBOInvoice): string {
    if (invoice.Balance === 0) {
      return 'paid';
    }
    if (invoice.Balance < invoice.TotalAmt) {
      return 'partial_payment';
    }
    if (invoice.EmailStatus === 'EmailSent') {
      return 'sent';
    }
    if (invoice.PrintStatus === 'NeedToPrint' || invoice.EmailStatus === 'NotSet') {
      return 'draft';
    }

    // Check if overdue
    const dueDate = new Date(invoice.DueDate);
    const today = new Date();
    if (dueDate < today && invoice.Balance > 0) {
      return 'overdue';
    }

    return 'sent';
  }

  /**
   * Get payment terms description
   */
  private getPaymentTerms(termId?: string): string {
    // This would typically require a lookup table or API call
    // Common QBO payment terms
    const termsMap: Record<string, string> = {
      '1': 'Net 15',
      '2': 'Net 30',
      '3': 'Net 60',
      '4': 'Due on receipt',
      '5': '2% 10 Net 30'
    };

    return termsMap[termId || ''] || 'Net 30';
  }

  /**
   * Transform QBO customer to standardized format
   */
  transformCustomer(qboCustomer: QBOCustomer): any {
    return {
      id: `qbo_customer_${qboCustomer.Id}`,
      name: qboCustomer.Name,
      displayName: qboCustomer.DisplayName,
      companyName: qboCustomer.CompanyName,
      contactName: qboCustomer.ContactName,
      email: qboCustomer.PrimaryEmailAddr?.Address,
      phone: qboCustomer.PrimaryPhone?.FreeFormNumber,
      website: qboCustomer.WebAddr?.URI,
      isActive: qboCustomer.Active,
      balance: qboCustomer.Balance,
      balanceWithJobs: qboCustomer.BalanceWithJobs,
      currency: qboCustomer.CurrencyRef?.name || 'USD',
      isTaxable: qboCustomer.Taxable,
      billingAddress: this.transformAddress(qboCustomer.BillAddr),
      shippingAddress: this.transformAddress(qboCustomer.ShipAddr),
      createdAt: qboCustomer.MetaData.CreateTime,
      updatedAt: qboCustomer.MetaData.LastUpdatedTime,
      metadata: {
        sourceSystem: 'quickbooks',
        externalId: qboCustomer.Id,
        syncToken: qboCustomer.SyncToken,
        printOnCheckName: qboCustomer.PrintOnCheckName
      }
    };
  }

  /**
   * Transform QBO address
   */
  private transformAddress(qboAddr?: any): any {
    if (!qboAddr) return undefined;

    return {
      line1: qboAddr.Line1,
      line2: qboAddr.Line2,
      city: qboAddr.City,
      state: qboAddr.CountrySubDivisionCode,
      postalCode: qboAddr.PostalCode,
      country: qboAddr.Country
    };
  }

  /**
   * Create a new invoice in QuickBooks
   */
  async createInvoice(invoiceData: {
    customerId: string;
    lineItems: Array<{
      itemId: string;
      quantity: number;
      unitPrice: number;
      description?: string;
      classId?: string;
    }>;
    txnDate?: string;
    dueDate?: string;
    privateNote?: string;
  }): Promise<QBOInvoice> {
    const invoice = {
      CustomerRef: {
        value: invoiceData.customerId
      },
      TxnDate: invoiceData.txnDate || new Date().toISOString().split('T')[0],
      DueDate: invoiceData.dueDate,
      PrivateNote: invoiceData.privateNote,
      Line: invoiceData.lineItems.map((item) => ({
        Amount: item.quantity * item.unitPrice,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: {
            value: item.itemId
          },
          UnitPrice: item.unitPrice,
          Qty: item.quantity,
          ...(item.classId && {
            ClassRef: {
              value: item.classId
            }
          })
        }
      }))
    };

    const response = await this.makeRequest<{
      Invoice: QBOInvoice;
    }>(`${this.baseUrl}/invoice`, 'POST', invoice);

    return response.Invoice;
  }

  /**
   * Make authenticated request to QuickBooks API
   */
  private async makeRequest<T>(url: string, method: string = 'GET', body?: any): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    // Add minor version to URL
    const separator = url.includes('?') ? '&' : '?';
    const urlWithVersion = `${url}${separator}minorversion=${this.config.minorVersion}`;

    const response = await fetch(urlWithVersion, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`QuickBooks API error: ${response.status} ${response.statusText} - ${error}`);
    }

    return await response.json() as T;
  }

  /**
   * Test the connection to QuickBooks
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/companyinfo/1`);
      return !!response;
    } catch {
      return false;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', this.config.refreshToken);

    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText} - ${error}`);
    }

    const data = await response.json() as any;
    
    // Update config with new tokens
    this.config.accessToken = data.access_token;
    this.config.refreshToken = data.refresh_token;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    };
  }
}

/**
 * Factory function to create QuickBooks client from environment variables
 */
export function createQuickBooksClient(): QuickBooksClient {
  const accessToken = process.env.QB_ACCESS_TOKEN;
  const refreshToken = process.env.QB_REFRESH_TOKEN;
  const realmId = process.env.QB_REALM_ID;
  const baseUrl = process.env.QB_BASE_URL;

  if (!accessToken || !refreshToken || !realmId) {
    throw new Error('QuickBooks configuration missing: QB_ACCESS_TOKEN, QB_REFRESH_TOKEN, and QB_REALM_ID are required');
  }

  return new QuickBooksClient({
    accessToken,
    refreshToken,
    realmId,
    baseUrl
  });
}