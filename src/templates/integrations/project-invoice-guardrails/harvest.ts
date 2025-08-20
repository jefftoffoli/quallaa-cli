/**
 * Harvest Integration for Project Invoice Guardrails
 * 
 * Handles fetching time entries, projects, and users from Harvest API
 */

export interface HarvestConfig {
  accountId: string;
  accessToken: string;
  userAgent: string;
}

export interface HarvestTimeEntry {
  id: number;
  spent_date: string;
  hours: number;
  notes: string;
  is_locked: boolean;
  locked_reason: string;
  is_closed: boolean;
  is_billed: boolean;
  timer_started_at: string;
  started_time: string;
  ended_time: string;
  is_running: boolean;
  billable: boolean;
  budgeted: boolean;
  billable_rate: number;
  cost_rate: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
  };
  client: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    name: string;
    code: string;
  };
  task: {
    id: number;
    name: string;
  };
  user_assignment: {
    id: number;
    is_project_manager: boolean;
    is_active: boolean;
    budget: number;
    created_at: string;
    updated_at: string;
    hourly_rate: number;
  };
  task_assignment: {
    id: number;
    billable: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    hourly_rate: number;
    budget: number;
  };
  invoice: {
    id: number;
    number: string;
  };
  external_reference: {
    id: string;
    group_id: string;
    account_id: string;
    permalink: string;
  };
}

export interface HarvestProject {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  is_billable: boolean;
  is_fixed_fee: boolean;
  bill_by: string;
  hourly_rate: number;
  budget: number;
  budget_by: string;
  budget_is_monthly: boolean;
  notify_when_over_budget: boolean;
  over_budget_notification_percentage: number;
  show_budget_to_all: boolean;
  cost_budget: number;
  cost_budget_include_expenses: boolean;
  fee: number;
  notes: string;
  starts_on: string;
  ends_on: string;
  created_at: string;
  updated_at: string;
  client: {
    id: number;
    name: string;
  };
}

export interface HarvestUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  timezone: string;
  has_access_to_all_future_projects: boolean;
  is_contractor: boolean;
  is_admin: boolean;
  is_project_manager: boolean;
  can_see_rates: boolean;
  can_create_projects: boolean;
  can_create_invoices: boolean;
  is_active: boolean;
  weekly_capacity: number;
  default_hourly_rate: number;
  cost_rate: number;
  roles: string[];
  access_roles: string[];
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface HarvestListResponse<T> {
  time_entries?: T[];
  projects?: T[];
  users?: T[];
  per_page: number;
  total_pages: number;
  total_entries: number;
  next_page: number;
  previous_page: number;
  page: number;
  links: {
    first: string;
    next: string;
    previous: string;
    last: string;
  };
}

export class HarvestClient {
  private config: HarvestConfig;
  private baseUrl: string;

  constructor(config: HarvestConfig) {
    this.config = config;
    this.baseUrl = 'https://api.harvestapp.com/v2';
  }

  /**
   * Fetch time entries with optional filters
   */
  async fetchTimeEntries(options: {
    userId?: number;
    projectId?: number;
    isBilled?: boolean;
    updatedSince?: string;
    from?: string;
    to?: string;
    page?: number;
    perPage?: number;
  } = {}): Promise<HarvestListResponse<HarvestTimeEntry>> {
    const params = new URLSearchParams();

    if (options.userId) params.append('user_id', options.userId.toString());
    if (options.projectId) params.append('project_id', options.projectId.toString());
    if (options.isBilled !== undefined) params.append('is_billed', options.isBilled.toString());
    if (options.updatedSince) params.append('updated_since', options.updatedSince);
    if (options.from) params.append('from', options.from);
    if (options.to) params.append('to', options.to);
    if (options.page) params.append('page', options.page.toString());
    if (options.perPage) params.append('per_page', options.perPage.toString());

    const url = `${this.baseUrl}/time_entries?${params}`;
    return this.makeRequest<HarvestListResponse<HarvestTimeEntry>>(url);
  }

  /**
   * Fetch all projects
   */
  async fetchProjects(options: {
    isActive?: boolean;
    clientId?: number;
    updatedSince?: string;
    page?: number;
    perPage?: number;
  } = {}): Promise<HarvestListResponse<HarvestProject>> {
    const params = new URLSearchParams();

    if (options.isActive !== undefined) params.append('is_active', options.isActive.toString());
    if (options.clientId) params.append('client_id', options.clientId.toString());
    if (options.updatedSince) params.append('updated_since', options.updatedSince);
    if (options.page) params.append('page', options.page.toString());
    if (options.perPage) params.append('per_page', options.perPage.toString());

    const url = `${this.baseUrl}/projects?${params}`;
    return this.makeRequest<HarvestListResponse<HarvestProject>>(url);
  }

  /**
   * Fetch all users
   */
  async fetchUsers(options: {
    isActive?: boolean;
    updatedSince?: string;
    page?: number;
    perPage?: number;
  } = {}): Promise<HarvestListResponse<HarvestUser>> {
    const params = new URLSearchParams();

    if (options.isActive !== undefined) params.append('is_active', options.isActive.toString());
    if (options.updatedSince) params.append('updated_since', options.updatedSince);
    if (options.page) params.append('page', options.page.toString());
    if (options.perPage) params.append('per_page', options.perPage.toString());

    const url = `${this.baseUrl}/users?${params}`;
    return this.makeRequest<HarvestListResponse<HarvestUser>>(url);
  }

  /**
   * Get a specific project
   */
  async getProject(projectId: number): Promise<HarvestProject> {
    const url = `${this.baseUrl}/projects/${projectId}`;
    return this.makeRequest<HarvestProject>(url);
  }

  /**
   * Get a specific time entry
   */
  async getTimeEntry(timeEntryId: number): Promise<HarvestTimeEntry> {
    const url = `${this.baseUrl}/time_entries/${timeEntryId}`;
    return this.makeRequest<HarvestTimeEntry>(url);
  }

  /**
   * Transform Harvest time entry to standardized TimeEntry format
   */
  transformTimeEntry(harvestEntry: HarvestTimeEntry): any {
    return {
      id: `harvest_${harvestEntry.id}`,
      employeeId: `harvest_user_${harvestEntry.user.id}`,
      employeeName: harvestEntry.user.name,
      projectId: `harvest_proj_${harvestEntry.project.id}`,
      taskId: `harvest_task_${harvestEntry.task.id}`,
      date: harvestEntry.spent_date,
      hours: harvestEntry.hours,
      rate: harvestEntry.billable_rate || harvestEntry.user_assignment?.hourly_rate || 0,
      billableAmount: harvestEntry.hours * (harvestEntry.billable_rate || harvestEntry.user_assignment?.hourly_rate || 0),
      task: harvestEntry.task.name,
      notes: harvestEntry.notes,
      billable: harvestEntry.billable,
      invoiceId: harvestEntry.invoice ? `harvest_invoice_${harvestEntry.invoice.id}` : null,
      status: harvestEntry.is_billed ? 'billed' : harvestEntry.is_locked ? 'approved' : 'submitted',
      createdAt: harvestEntry.created_at,
      updatedAt: harvestEntry.updated_at,
      metadata: {
        sourceSystem: 'harvest',
        externalId: harvestEntry.id.toString(),
        harvestProjectCode: harvestEntry.project.code,
        harvestClientName: harvestEntry.client.name,
        isLocked: harvestEntry.is_locked,
        lockedReason: harvestEntry.locked_reason,
        isClosed: harvestEntry.is_closed,
        isRunning: harvestEntry.is_running,
        costRate: harvestEntry.cost_rate,
        budgeted: harvestEntry.budgeted
      }
    };
  }

  /**
   * Transform Harvest project to standardized Project format
   */
  transformProject(harvestProject: HarvestProject): any {
    return {
      id: `harvest_proj_${harvestProject.id}`,
      name: harvestProject.name,
      code: harvestProject.code,
      clientId: `harvest_client_${harvestProject.client.id}`,
      clientName: harvestProject.client.name,
      status: harvestProject.is_active ? 'active' : 'completed',
      startDate: harvestProject.starts_on,
      endDate: harvestProject.ends_on,
      budget: {
        totalAmount: harvestProject.budget || 0,
        hoursAllocated: harvestProject.budget_by === 'project_cost' ? 0 : harvestProject.budget,
        hoursUsed: 0, // Would need to calculate from time entries
        amountInvoiced: 0, // Would need to calculate from invoices
        amountPaid: 0 // Would need to fetch from accounting system
      },
      contractType: harvestProject.is_fixed_fee ? 'fixed_fee' : 'time_materials',
      billingFrequency: 'monthly', // Default - would need to come from SOW
      currency: 'USD', // Default - would need to come from client settings
      createdAt: harvestProject.created_at,
      updatedAt: harvestProject.updated_at,
      metadata: {
        sourceSystem: 'harvest',
        externalId: harvestProject.id.toString(),
        billBy: harvestProject.bill_by,
        hourlyRate: harvestProject.hourly_rate,
        budgetBy: harvestProject.budget_by,
        budgetIsMonthly: harvestProject.budget_is_monthly,
        overBudgetNotification: harvestProject.over_budget_notification_percentage,
        fee: harvestProject.fee,
        notes: harvestProject.notes
      }
    };
  }

  /**
   * Transform Harvest user to team member format
   */
  transformUser(harvestUser: HarvestUser): any {
    return {
      employeeId: `harvest_user_${harvestUser.id}`,
      name: `${harvestUser.first_name} ${harvestUser.last_name}`,
      email: harvestUser.email,
      isActive: harvestUser.is_active,
      roles: harvestUser.roles,
      defaultRate: harvestUser.default_hourly_rate,
      costRate: harvestUser.cost_rate,
      weeklyCapacity: harvestUser.weekly_capacity,
      permissions: {
        isAdmin: harvestUser.is_admin,
        isProjectManager: harvestUser.is_project_manager,
        canSeeRates: harvestUser.can_see_rates,
        canCreateProjects: harvestUser.can_create_projects,
        canCreateInvoices: harvestUser.can_create_invoices
      },
      metadata: {
        sourceSystem: 'harvest',
        externalId: harvestUser.id.toString(),
        isContractor: harvestUser.is_contractor,
        timezone: harvestUser.timezone,
        avatarUrl: harvestUser.avatar_url
      }
    };
  }

  /**
   * Get project time summary
   */
  async getProjectTimeSummary(projectId: number, fromDate?: string, toDate?: string): Promise<{
    totalHours: number;
    billableHours: number;
    totalAmount: number;
    billableAmount: number;
    entriesCount: number;
  }> {
    const timeEntries = await this.fetchTimeEntries({
      projectId,
      from: fromDate,
      to: toDate
    });

    const summary = {
      totalHours: 0,
      billableHours: 0,
      totalAmount: 0,
      billableAmount: 0,
      entriesCount: timeEntries.time_entries?.length || 0
    };

    for (const entry of timeEntries.time_entries || []) {
      summary.totalHours += entry.hours;
      
      const amount = entry.hours * (entry.billable_rate || entry.user_assignment?.hourly_rate || 0);
      summary.totalAmount += amount;

      if (entry.billable) {
        summary.billableHours += entry.hours;
        summary.billableAmount += amount;
      }
    }

    return summary;
  }

  /**
   * Make authenticated request to Harvest API
   */
  private async makeRequest<T>(url: string, method: string = 'GET', body?: any): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Harvest-Account-ID': this.config.accountId,
        'User-Agent': this.config.userAgent,
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Harvest API error: ${response.status} ${response.statusText} - ${error}`);
    }

    return await response.json() as T;
  }

  /**
   * Test the connection to Harvest
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/users/me`);
      return !!response;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create Harvest client from environment variables
 */
export function createHarvestClient(): HarvestClient {
  const accountId = process.env.HARVEST_ACCOUNT_ID;
  const accessToken = process.env.HARVEST_ACCESS_TOKEN;
  const userAgent = process.env.HARVEST_USER_AGENT || 'Quallaa CLI Project Invoice Guardrails (your-email@domain.com)';

  if (!accountId || !accessToken) {
    throw new Error('Harvest configuration missing: HARVEST_ACCOUNT_ID and HARVEST_ACCESS_TOKEN are required');
  }

  return new HarvestClient({
    accountId,
    accessToken,
    userAgent
  });
}