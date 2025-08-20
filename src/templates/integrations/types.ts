// Placeholder types for integration files
export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  seniority?: string;
  industry?: string;
  source?: string;
  originalSource?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    landingPage?: string;
  };
  leadScore?: number;
  leadGrade?: string;
  status?: string;
  assignedTo?: string;
  assignedAt?: string;
  consent?: {
    email: boolean;
    timestamp: string;
    source: string;
    gdprLawfulBasis: string;
  };
  createdAt?: string;
  updatedAt?: string;
  metadata?: any;
}

export interface Order {
  id: string;
  orderNumber?: string;
  customerId?: string;
  customerEmail?: string;
  status?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  totalAmount?: number;
  subtotalAmount?: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  refundedAmount?: number;
  currency?: string;
  items?: any[];
  transactions?: any[];
  shippingAddress?: any;
  billingAddress?: any;
  tags?: string[];
  source?: string;
  channel?: string;
  createdAt?: string;
  updatedAt?: string;
  cancelledAt?: string;
  closedAt?: string;
  metadata?: any;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type?: string;
  method?: string;
  bankAccount?: {
    id: string;
    last4: string;
    bankName: string;
    country: string;
    currency: string;
  };
  balanceTransactions?: any[];
  feeDetails?: any[];
  summary?: any;
  arrivalDate?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: any;
}