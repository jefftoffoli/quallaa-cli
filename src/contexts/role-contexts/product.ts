import { RoleContext } from '../../types';

export const productContext: RoleContext = {
  title: 'Product Manager Context',
  description: 'Configuration guidance for product managers setting up user analytics and testing in an AI-assisted development environment.',
  specificSections: [
    'User Analytics & Tracking',
    'A/B Testing Framework',
    'Feature Flag Management',
    'Customer Feedback Systems',
  ],
  commonTasks: [
    'Track user behavior and feature adoption',
    'Run A/B tests on product changes',
    'Measure conversion funnels and drop-off points',
    'Analyze customer feedback and feature requests',
    'Create custom dashboards for stakeholders',
    'Monitor product performance metrics',
    'Segment users based on behavior patterns',
    'Generate product insights reports',
  ],
  libraries: [
    'Vercel Analytics - User behavior tracking',
    'React Hook Form - Form analytics and conversion tracking',
    'Chart.js / Recharts - Custom dashboard visualizations',
    'Supabase Realtime - Live user activity monitoring',
    'Zod - Input validation and data quality',
    'Date-fns - Time-based analytics',
    'React Query - Efficient data fetching for dashboards',
    'Framer Motion - User interaction animations',
  ],
};

export const productSections = `
## User Analytics & Tracking Context
Basic user analytics and tracking setup:
- Event tracking: Custom events for user actions and feature usage
- Funnel analysis: Conversion tracking through user journeys
- Cohort analysis: User retention and engagement over time
- Session recording: Understanding user behavior patterns
- Performance metrics: Page load times and user experience metrics
- Custom dimensions: Track product-specific metrics that matter to your business

## A/B Testing Framework
- Feature flags: Toggle features for different user segments
- Statistical significance: Proper sample size and confidence intervals
- Metric tracking: Compare conversion rates across test variants
- User assignment: Consistent assignment to test groups
- Results analysis: Clear reporting on test outcomes
- Rollout strategy: Gradual feature rollout based on test results

## Feature Flag Management
- Database-driven feature flags with real-time updates
- User segment targeting (role, plan, location, etc.)
- Percentage-based rollouts for gradual feature releases
- Emergency kill switches for quick feature disable
- A/B test integration with feature flag system
- Analytics integration to measure flag impact

## Customer Feedback Systems
- In-app feedback collection with contextual triggers
- Feature request voting and prioritization
- User interview scheduling and management
- Feedback categorization and sentiment analysis
- Integration with product roadmap planning
- Customer success team collaboration tools

## Product-Specific Libraries
- Analytics: Custom event tracking, user journey analysis
- Experimentation: A/B test framework with statistical analysis  
- Feedback: User survey integration, feature request management
- Metrics: KPI dashboards, conversion funnel analysis
- Segmentation: User cohort analysis, behavioral targeting

## Common Product Management Tasks
- Monitor feature adoption rates and usage patterns
- Set up conversion funnels for key user journeys
- Create user segments based on behavior and demographics
- Run experiments to optimize product metrics
- Build custom reports for executive stakeholders
- Track customer satisfaction and Net Promoter Score
- Analyze user feedback to inform product roadmap
- Monitor product performance across different user segments
`;