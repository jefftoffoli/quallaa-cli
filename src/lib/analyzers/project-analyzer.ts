import { glob } from 'glob';
import * as path from 'path';

export interface ProjectAnalysis {
  contracts: ContractAnalysis[];
  apis: ApiAnalysis[];
  metrics: MetricAnalysis[];
  integrations: IntegrationAnalysis[];
}

export interface ContractAnalysis {
  name: string;
  file: string;
  schema: any;
  description?: string;
  types: string[];
}

export interface ApiAnalysis {
  name: string;
  type: 'internal' | 'external';
  baseUrl?: string;
  endpoints: EndpointAnalysis[];
  file: string;
  authentication?: string;
}

export interface EndpointAnalysis {
  path: string;
  method: string;
  description?: string;
  parameters?: any;
  response?: any;
}

export interface MetricAnalysis {
  name: string;
  type: 'kpi' | 'event' | 'counter' | 'gauge';
  description?: string;
  file: string;
  category?: string;
}

export interface IntegrationAnalysis {
  service: string;
  type: 'webhook' | 'api' | 'sdk';
  description?: string;
  files: string[];
  configuration?: any;
}

export class ProjectAnalyzer {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Analyze the entire project for contracts, APIs, and metrics
   */
  async analyzeProject(): Promise<ProjectAnalysis> {
    const [contracts, apis, metrics, integrations] = await Promise.all([
      this.analyzeContracts(),
      this.analyzeApis(),
      this.analyzeMetrics(),
      this.analyzeIntegrations(),
    ]);

    return {
      contracts,
      apis,
      metrics,
      integrations,
    };
  }

  /**
   * Analyze data contracts from /contracts directory and TypeScript files
   */
  async analyzeContracts(): Promise<ContractAnalysis[]> {
    const contracts: ContractAnalysis[] = [];
    const fs = await import('fs/promises');

    try {
      // Look for contracts in dedicated contracts directory
      const contractFiles = await glob('contracts/**/*.{ts,js,json}', { 
        cwd: this.projectRoot,
        absolute: true 
      });

      for (const file of contractFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const contract = await this.parseContractFile(file, content);
          if (contract) {
            contracts.push(contract);
          }
        } catch (error) {
          console.warn(`Failed to parse contract file ${file}:`, error);
        }
      }

      // Look for schemas in lib/types, types, or similar directories
      const typeFiles = await glob('{lib/types,types,src/types}/**/*.{ts,js}', { 
        cwd: this.projectRoot,
        absolute: true 
      });

      for (const file of typeFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const schemas = await this.extractSchemasFromTypeFile(file, content);
          contracts.push(...schemas);
        } catch (error) {
          console.warn(`Failed to parse type file ${file}:`, error);
        }
      }

    } catch (error) {
      console.warn('Error analyzing contracts:', error);
    }

    return contracts;
  }

  /**
   * Analyze API endpoints from app/api and other API-related files
   */
  async analyzeApis(): Promise<ApiAnalysis[]> {
    const apis: ApiAnalysis[] = [];
    const fs = await import('fs/promises');

    try {
      // Analyze Next.js API routes
      const apiRoutes = await glob('app/api/**/route.{ts,js}', { 
        cwd: this.projectRoot,
        absolute: true 
      });

      const internalEndpoints: EndpointAnalysis[] = [];

      for (const file of apiRoutes) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const endpoints = await this.parseApiRoute(file, content);
          internalEndpoints.push(...endpoints);
        } catch (error) {
          console.warn(`Failed to parse API route ${file}:`, error);
        }
      }

      if (internalEndpoints.length > 0) {
        apis.push({
          name: 'Internal API',
          type: 'internal',
          endpoints: internalEndpoints,
          file: 'app/api',
        });
      }

      // Analyze external API integrations
      const integrationFiles = await glob('{lib,src,connectors}/**/*.{ts,js}', { 
        cwd: this.projectRoot,
        absolute: true 
      });

      for (const file of integrationFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const externalApis = await this.extractExternalApis(file, content);
          apis.push(...externalApis);
        } catch (error) {
          console.warn(`Failed to parse integration file ${file}:`, error);
        }
      }

    } catch (error) {
      console.warn('Error analyzing APIs:', error);
    }

    return apis;
  }

  /**
   * Analyze metrics and KPIs from the codebase
   */
  async analyzeMetrics(): Promise<MetricAnalysis[]> {
    const metrics: MetricAnalysis[] = [];
    const fs = await import('fs/promises');

    try {
      // Look for metrics in evaluators, analytics, or metrics directories
      const metricFiles = await glob('{evaluators,analytics,metrics,lib/analytics}/**/*.{ts,js}', { 
        cwd: this.projectRoot,
        absolute: true 
      });

      for (const file of metricFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const fileMetrics = await this.extractMetrics(file, content);
          metrics.push(...fileMetrics);
        } catch (error) {
          console.warn(`Failed to parse metrics file ${file}:`, error);
        }
      }

      // Look for tracking events in components and API routes
      const trackingFiles = await glob('{app,components,lib}/**/*.{ts,tsx,js,jsx}', { 
        cwd: this.projectRoot,
        absolute: true 
      });

      for (const file of trackingFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const events = await this.extractTrackingEvents(file, content);
          metrics.push(...events);
        } catch (error) {
          console.warn(`Failed to parse tracking file ${file}:`, error);
        }
      }

    } catch (error) {
      console.warn('Error analyzing metrics:', error);
    }

    return metrics;
  }

  /**
   * Analyze service integrations
   */
  async analyzeIntegrations(): Promise<IntegrationAnalysis[]> {
    const integrations: IntegrationAnalysis[] = [];
    const fs = await import('fs/promises');

    try {
      // Analyze package.json for service dependencies
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Map dependencies to known services
      const serviceMap = {
        '@supabase/supabase-js': 'Supabase',
        '@supabase/ssr': 'Supabase',
        'resend': 'Resend',
        'typesense': 'Typesense',
        'stripe': 'Stripe',
        '@hubspot/api-client': 'HubSpot',
        'salesforce': 'Salesforce',
        '@clerk/nextjs': 'Clerk',
        'next-auth': 'NextAuth',
        '@auth0/nextjs-auth0': 'Auth0',
      };

      for (const [dep, service] of Object.entries(serviceMap)) {
        if (dependencies[dep]) {
          const integration = await this.analyzeServiceIntegration(service, dep);
          if (integration) {
            integrations.push(integration);
          }
        }
      }

    } catch (error) {
      console.warn('Error analyzing integrations:', error);
    }

    return integrations;
  }

  /**
   * Parse a contract file and extract schema information
   */
  private async parseContractFile(file: string, content: string): Promise<ContractAnalysis | null> {
    
    try {
      // Look for exported schemas
      const schemaMatches = content.match(/export\s+const\s+(\w+Schema)\s*=\s*({[\s\S]*?})\s*(?:as\s+const)?;?/g);
      
      if (schemaMatches && schemaMatches.length > 0) {
        const schemaMatch = schemaMatches[0];
        const nameMatch = schemaMatch.match(/export\s+const\s+(\w+Schema)/);
        const schemaContentMatch = schemaMatch.match(/=\s*({[\s\S]*?})\s*(?:as\s+const)?;?$/);
        
        if (nameMatch && schemaContentMatch) {
          try {
            // Try to parse as JSON (simplified - in real implementation, would use AST parsing)
            const schemaContent = schemaContentMatch[1]
              .replace(/(\w+):/g, '"$1":') // Quote unquoted keys
              .replace(/'/g, '"') // Convert single quotes to double quotes
              .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
            
            const schema = JSON.parse(schemaContent);
            
            // Extract description from comments
            const descriptionMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^\n]*)\s*\n[\s\S]*?\*\//);
            const description = descriptionMatch ? descriptionMatch[1].trim() : undefined;

            // Extract TypeScript types
            const typeMatches = content.match(/export\s+(?:type|interface)\s+(\w+)/g);
            const types = typeMatches ? typeMatches.map(match => match.match(/(\w+)$/)?.[1] || '').filter(Boolean) : [];

            return {
              name: nameMatch[1].replace('Schema', ''),
              file: path.relative(this.projectRoot, file),
              schema,
              description,
              types,
            };
          } catch (parseError) {
            console.warn(`Failed to parse schema in ${file}:`, parseError);
          }
        }
      }
    } catch (error) {
      console.warn(`Error parsing contract file ${file}:`, error);
    }

    return null;
  }

  /**
   * Extract schemas from TypeScript type files
   */
  private async extractSchemasFromTypeFile(file: string, content: string): Promise<ContractAnalysis[]> {
    const contracts: ContractAnalysis[] = [];
    
    // Look for interface definitions
    const interfaceMatches = content.match(/export\s+interface\s+(\w+)\s*{[\s\S]*?^}/gm);
    
    if (interfaceMatches) {
      for (const match of interfaceMatches) {
        const nameMatch = match.match(/interface\s+(\w+)/);
        if (nameMatch) {
          contracts.push({
            name: nameMatch[1],
            file: path.relative(this.projectRoot, file),
            schema: { type: 'interface', definition: match },
            types: [nameMatch[1]],
          });
        }
      }
    }

    return contracts;
  }

  /**
   * Parse Next.js API route file
   */
  private async parseApiRoute(file: string, content: string): Promise<EndpointAnalysis[]> {
    const endpoints: EndpointAnalysis[] = [];
    const relativePath = path.relative(this.projectRoot, file);
    
    // Extract API path from file path
    const apiPath = relativePath
      .replace(/^app\/api/, '')
      .replace(/\/route\.(ts|js)$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1') // Convert [param] to :param
      || '/';

    // Look for HTTP method exports
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
    for (const method of methods) {
      const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(`, 'g');
      if (methodRegex.test(content)) {
        // Extract JSDoc comments for description
        const funcRegex = new RegExp(`\\/\\*\\*[\\s\\S]*?\\*\\/\\s*export\\s+async\\s+function\\s+${method}`, 'g');
        const funcMatch = content.match(funcRegex);
        const description = funcMatch?.[0]?.match(/\/\*\*\s*\n\s*\*\s*([^\n]*)/)?.[1]?.trim();

        endpoints.push({
          path: apiPath,
          method: method.toLowerCase(),
          description,
        });
      }
    }

    return endpoints;
  }

  /**
   * Extract external API configurations from files
   */
  private async extractExternalApis(file: string, content: string): Promise<ApiAnalysis[]> {
    const apis: ApiAnalysis[] = [];

    // Look for API base URLs and client configurations
    const urlMatches = content.match(/(?:baseURL|base_url|apiUrl|API_URL)\s*[:=]\s*['"`]([^'"`]+)['"`]/gi);
    
    if (urlMatches) {
      for (const match of urlMatches) {
        const urlMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (urlMatch) {
          const baseUrl = urlMatch[1];
          
          // Try to determine service name from URL or file
          const serviceName = this.extractServiceName(baseUrl, file);
          
          apis.push({
            name: serviceName,
            type: 'external',
            baseUrl,
            file: path.relative(this.projectRoot, file),
            endpoints: [], // Would need more sophisticated parsing to extract all endpoints
          });
        }
      }
    }

    return apis;
  }

  /**
   * Extract metrics from files
   */
  private async extractMetrics(file: string, content: string): Promise<MetricAnalysis[]> {
    const metrics: MetricAnalysis[] = [];

    // Look for metric definitions
    const metricPatterns = [
      /(?:export\s+const\s+)?(\w+(?:Rate|Count|Time|Score|Percentage))\s*[:=]/gi,
      /track\w*\(['"`]([^'"`]+)['"`]/gi,
      /metric\w*\(['"`]([^'"`]+)['"`]/gi,
      /kpi\w*\(['"`]([^'"`]+)['"`]/gi,
    ];

    for (const pattern of metricPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const metricName = match[1];
        
        // Determine metric type based on name patterns
        let type: MetricAnalysis['type'] = 'gauge';
        if (metricName.includes('Rate') || metricName.includes('Percentage')) {
          type = 'kpi';
        } else if (metricName.includes('Count')) {
          type = 'counter';
        } else if (metricName.includes('Time')) {
          type = 'gauge';
        }

        metrics.push({
          name: metricName,
          type,
          file: path.relative(this.projectRoot, file),
        });
      }
    }

    return metrics;
  }

  /**
   * Extract tracking events from files
   */
  private async extractTrackingEvents(file: string, content: string): Promise<MetricAnalysis[]> {
    const events: MetricAnalysis[] = [];

    // Look for tracking event calls
    const eventPatterns = [
      /analytics\.track\(['"`]([^'"`]+)['"`]/gi,
      /gtag\(['"`]event['"`],\s*['"`]([^'"`]+)['"`]/gi,
      /posthog\.capture\(['"`]([^'"`]+)['"`]/gi,
    ];

    for (const pattern of eventPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        events.push({
          name: match[1],
          type: 'event',
          file: path.relative(this.projectRoot, file),
          category: 'tracking',
        });
      }
    }

    return events;
  }

  /**
   * Analyze a specific service integration
   */
  private async analyzeServiceIntegration(service: string, dependency: string): Promise<IntegrationAnalysis | null> {
    try {
      // Look for configuration files and integration code
      const serviceFiles = await glob(`{lib,src,connectors}/**/*${service.toLowerCase()}*.{ts,js}`, { 
        cwd: this.projectRoot,
        absolute: true 
      });

      if (serviceFiles.length === 0) {
        return null;
      }

      const files = serviceFiles.map(file => path.relative(this.projectRoot, file));

      return {
        service,
        type: 'sdk',
        description: `Integration with ${service} using ${dependency}`,
        files,
      };
    } catch (error) {
      console.warn(`Error analyzing ${service} integration:`, error);
      return null;
    }
  }

  /**
   * Extract service name from URL or file path
   */
  private extractServiceName(url: string, file: string): string {
    // Try to extract from URL
    if (url.includes('supabase')) return 'Supabase API';
    if (url.includes('stripe')) return 'Stripe API';
    if (url.includes('resend')) return 'Resend API';
    if (url.includes('typesense')) return 'Typesense API';
    if (url.includes('hubspot')) return 'HubSpot API';
    if (url.includes('salesforce')) return 'Salesforce API';
    if (url.includes('github')) return 'GitHub API';
    
    // Try to extract from file path
    const fileName = path.basename(file, path.extname(file));
    return fileName.charAt(0).toUpperCase() + fileName.slice(1) + ' API';
  }
}

export const projectAnalyzer = new ProjectAnalyzer();