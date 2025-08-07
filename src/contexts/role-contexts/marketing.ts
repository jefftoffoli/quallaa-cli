import { RoleContext } from '../../types';

export const marketingContext: RoleContext = {
  title: 'Marketing Lead Context',
  description: 'This system replaces expensive marketing SaaS with AI-native automation for customer data analysis, campaign management, and growth optimization.',
  specificSections: [
    'Customer Data & Segmentation',
    'Campaign Performance Tracking',
    'Attribution Modeling',
    'Email Marketing Automation',
  ],
  commonTasks: [
    'Track campaign performance across all channels',
    'Segment customers based on behavior and demographics',
    'Automate email sequences based on user actions',
    'Generate attribution reports for budget optimization',
    'Create personalized customer journeys',
    'Analyze customer lifetime value and acquisition costs',
    'Build custom marketing dashboards',
    'Run growth experiments and measure results',
  ],
  libraries: [
    'Resend - Transactional email and automated sequences',
    'Chart.js / Recharts - Campaign performance visualizations',
    'React Hook Form - Lead capture form optimization',
    'Supabase Realtime - Live campaign monitoring',
    'Date-fns - Time-based campaign analysis',
    'Zod - Lead validation and data quality',
    'React Query - Efficient campaign data management',
    'Framer Motion - Landing page animations and CTAs',
  ],
};

export const marketingSections = `
## Customer Data & Segmentation Context
This system replaces expensive marketing SaaS (HubSpot, Marketo) with custom solutions:
- Lead scoring: Custom algorithms based on behavior and engagement
- Customer segmentation: Behavioral, demographic, and psychographic segments
- Lifecycle tracking: From lead to customer to advocate
- Data enrichment: Combine first-party data with external sources
- Privacy compliance: GDPR and CCPA compliant data collection
- Real-time personalization: Dynamic content based on user segments

## Campaign Performance Tracking
- Multi-channel attribution: Track performance across email, social, paid ads
- Conversion tracking: Monitor goals and KPIs across campaigns
- ROI calculation: Revenue attribution by channel and campaign
- A/B testing: Test messaging, creative, and targeting
- Customer journey mapping: Understand touchpoints that drive conversions
- Campaign automation: Trigger-based campaigns and sequences

## Attribution Modeling
- First-touch attribution: Track initial customer acquisition sources
- Last-touch attribution: Identify final conversion drivers
- Multi-touch attribution: Credit multiple touchpoints in customer journey
- Custom attribution models: Weight touchpoints based on business logic
- Revenue attribution: Connect marketing activities to revenue outcomes
- Cross-device tracking: Identify users across multiple devices

## Email Marketing Automation
- Behavioral triggers: Send emails based on user actions
- Drip campaigns: Automated sequences for nurturing leads
- Segmented campaigns: Targeted messages for specific user groups
- Performance tracking: Open rates, click rates, conversion rates
- A/B testing: Test subject lines, content, and send times
- Deliverability optimization: Maintain sender reputation and inbox placement

## Marketing-Specific Libraries
- Analytics: Custom tracking, multi-touch attribution modeling
- Email: Automated sequences, behavioral triggers, segmentation
- CRM: Customer lifecycle tracking, lead scoring algorithms  
- Attribution: Revenue attribution, campaign performance analysis
- Personalization: Dynamic content, behavioral targeting
- Growth: Experiment tracking, conversion optimization

## Common Marketing Operations Tasks
- Set up tracking for all marketing channels and campaigns
- Create customer segments for targeted marketing
- Build email automation sequences for different user journeys
- Analyze customer acquisition costs and lifetime value
- Generate weekly/monthly marketing performance reports
- Run growth experiments to improve conversion rates
- Track attribution across multiple touchpoints
- Optimize landing pages and conversion funnels
- Monitor customer satisfaction and retention metrics
- Create custom marketing dashboards for stakeholder reporting
`;