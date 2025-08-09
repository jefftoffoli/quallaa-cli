import { RoleContext } from '../../types';

export const operationsContext: RoleContext = {
  title: 'Operations Manager Context',
  description: 'Configuration guidance for operations teams setting up process automation, data pipelines, and reporting systems in an AI-assisted development environment.',
  specificSections: [
    'Process Automation',
    'Data Pipeline Management', 
    'Reporting & Dashboards',
    'Integration Management',
  ],
  commonTasks: [
    'Automate repetitive business processes',
    'Create data pipelines for business intelligence',
    'Build custom reporting dashboards',
    'Integrate multiple systems and data sources',
    'Monitor operational metrics and KPIs',
    'Optimize workflows for efficiency',
    'Track team productivity and performance',
    'Generate executive reports and insights',
  ],
  libraries: [
    'Supabase Functions - Serverless automation workflows',
    'Vercel Cron Jobs - Scheduled process automation',
    'Chart.js / Recharts - Operations dashboard visualizations',
    'React Hook Form - Process workflow forms',
    'Zod - Data validation and quality control',
    'Date-fns - Time-based operations analytics',
    'React Query - Efficient operations data management',
    'CSV-Parser - Data import and export automation',
  ],
};

export const operationsSections = `
## Process Automation Context
Process automation and workflow setup:
- Workflow automation: Custom business process automation
- Data synchronization: Keep multiple systems in sync
- Notification systems: Automated alerts and reminders  
- Document generation: Automated report and document creation
- Approval workflows: Multi-step approval processes
- Task scheduling: Automated recurring tasks and processes

## Data Pipeline Management
- ETL processes: Extract, transform, and load data from multiple sources
- Data validation: Ensure data quality and consistency
- Real-time processing: Process data as it arrives
- Batch processing: Handle large data volumes efficiently
- Error handling: Robust error recovery and alerting
- Data archiving: Long-term data storage and retrieval

## Reporting & Dashboards
- Executive dashboards: High-level KPI tracking for leadership
- Operational metrics: Day-to-day operations monitoring
- Custom reports: Tailored reports for different stakeholders
- Automated reporting: Scheduled report generation and distribution
- Data visualization: Charts and graphs for better insights
- Real-time monitoring: Live operational status tracking

## Integration Management
- API integrations: Connect with external services and systems
- Webhook processing: Handle real-time data from external systems
- Data transformation: Convert data between different formats
- Authentication management: Secure connections to external services
- Rate limiting: Manage API usage and costs
- Error handling: Robust integration error recovery

## Operations-Specific Libraries
- Automation: Workflow engines, scheduled job processing
- Data Processing: ETL pipelines, data validation, transformation
- Reporting: Dashboard creation, automated report generation
- Integration: API clients, webhook handlers, data synchronization
- Monitoring: System health checks, performance tracking
- Analytics: Operations metrics, efficiency measurement

## Common Operations Tasks
- Set up automated data imports from external systems
- Create executive dashboards with key business metrics
- Build workflows for approval processes and task routing
- Monitor system performance and operational health
- Generate weekly/monthly operations reports
- Automate invoice processing and payment workflows
- Track team productivity and project progress
- Create data pipelines for business intelligence
- Set up alerting for critical operational issues
- Optimize resource allocation and capacity planning
- Build custom forms for internal process management
- Integrate customer support tools with internal systems
`;