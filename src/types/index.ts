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

export type OutcomeTemplate = 'order-cash-reco' | 'lead-lifecycle-core';

export interface OutcomeConfig extends ProjectConfig {
  template: OutcomeTemplate;
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

export interface OutcomeTemplateDefinition {
  name: string;
  description: string;
  domain: string;
  requiredServices: string[];
  optionalServices: string[];
  dataContracts: DataContract[];
  connectors: ServiceConnector[];
  evaluatorMetrics: string[];
  claudeSections: string[];
}