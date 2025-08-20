export type Role = 'founder' | 'product' | 'marketing' | 'operations';

export interface LeadInfo {
  name: string;
  email: string;
  company?: string;
  role?: Role;
  createdAt: Date;
}

export interface ProjectConfig {
  name: string;
  role: Role;
  services: string[];
  leadInfo: LeadInfo | null;
}

export interface ServiceCredentials {
  vercel?: {
    token: string;
    teamId?: string;
  };
  supabase?: {
    accessToken: string;
    projectRef: string;
    anonKey: string;
    serviceRoleKey: string;
    dbUrl: string;
  };
  github?: {
    token: string;
    username: string;
  };
  resend?: {
    apiKey: string;
    domain?: string;
  };
  typesense?: {
    apiKey: string;
    host: string;
    port: string;
    protocol: string;
  };
}

export interface CLIConfig {
  version: string;
  lastUpdateCheck?: Date;
  analytics: boolean;
  credentials?: ServiceCredentials;
}

export interface RoleContext {
  title: string;
  description: string;
  specificSections: string[];
  commonTasks: string[];
  libraries: string[];
}

export interface ServiceSetupResult {
  success: boolean;
  service: string;
  message?: string;
  error?: Error;
  credentials?: Partial<ServiceCredentials>;
}

export type OutcomeTemplate = 'order-cash-reco' | 'lead-lifecycle-core' | 'project-invoice-guardrails' | 'donor-member-rollups' | 'inventory-pricing-sync';

export interface OutcomeConfig extends ProjectConfig {
  template: OutcomeTemplate;
  stackVariant?: StackVariant;
  demo?: boolean;
}

export interface DataContract {
  name: string;
  description: string;
  schema: Record<string, any>;
}

export interface ServiceConnector {
  name: string;
  type: 'input' | 'output' | 'bidirectional';
  service: string;
  description: string;
  config: Record<string, any>;
}

export interface StackVariant {
  name: string;
  description: string;
  isMinimal?: boolean;
  requiredServices?: string[];
  optionalServices?: string[];
  architecture: 'web-jobs' | 'headless-worker' | {
    framework: string;
    database: string;
    queue?: string;
    deployment: string;
  };
  deployment: 'vercel' | 'fly' | 'railway' | {
    frontend?: string;
    database?: string;
    jobs?: string;
  };
  features?: string[];
}

export interface OutcomeTemplateDefinition {
  name: string;
  description: string;
  category?: string;
  domain?: string;
  tags?: string[];
  estimatedSetupTime?: string;
  
  stackVariants: StackVariant[];
  
  services?: {
    required?: string[];
    optional?: string[];
    integrations?: Record<string, string[]>;
  };
  
  outcomes?: {
    primary: string;
    metrics: string[];
    businessValue: string;
  };
  
  dataContracts?: Record<string, {
    description: string;
    schema: string;
    sampleData?: string | null;
  }>;
  
  integrations?: Record<string, {
    description: string;
    implementation: string;
    configRequired: string[];
    capabilities: string[];
  }>;
  
  jobs?: Array<{
    name: string;
    description: string;
    schedule: string;
    timeout: string;
  }>;
  
  evaluators?: Record<string, {
    description: string;
    goldDataset: string;
    metrics: string[];
    thresholds: Record<string, { min?: number; max?: number; target: number }>;
  }>;
  
  reports?: Array<{
    name: string;
    description: string;
    format: string;
    schedule: string;
    path: string;
  }>;
  
  webInterface?: {
    enabled: boolean;
    description: string;
    routes: Array<{
      path: string;
      description: string;
    }>;
  };
  
  compliance?: {
    frameworks: string[];
    features: string[];
  };
  
  idealCustomerProfile?: {
    industry: string[];
    companySize: string;
    painPoints: string[];
    triggers: string[];
  };
  
  demoScenarios?: Array<{
    name: string;
    description: string;
  }>;
  
  generatedFiles?: string[];

  // Legacy fields for backward compatibility
  requiredServices?: string[];
  optionalServices?: string[];
  legacyDataContracts?: DataContract[];
  connectors?: ServiceConnector[];
  evaluatorMetrics?: string[];
  claudeSections?: string[];
}