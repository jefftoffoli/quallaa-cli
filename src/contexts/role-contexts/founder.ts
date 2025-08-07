import { RoleContext } from '../../types';

export const founderContext: RoleContext = {
  title: 'Technical Co-Founder / First Engineer Context',
  description: 'This system empowers technical leaders to build scalable, AI-native solutions without vendor lock-in or expensive SaaS dependencies.',
  specificSections: [
    'Architecture Decisions',
    'Team Scaling',
    'Technical Debt Management',
    'Performance Optimization',
  ],
  commonTasks: [
    'Design scalable architecture for rapid growth',
    'Build MVP with production-ready infrastructure',
    'Implement monitoring and observability',
    'Set up CI/CD pipelines for team development',
    'Create technical documentation for team onboarding',
    'Establish code review and quality processes',
    'Plan technical roadmap aligned with business goals',
    'Optimize costs while maintaining performance',
  ],
  libraries: [
    'Next.js - Full-stack React framework',
    'TypeScript - Type safety and developer experience',
    'TailwindCSS - Utility-first styling system',
    'Prisma - Type-safe database ORM',
    'React Hook Form - Form state management',
    'Zod - Runtime type validation',
    'React Query - Server state management',
    'Vercel Analytics - Performance monitoring',
  ],
};

export const founderSections = `
## Architecture Decisions Context
This system replaces expensive enterprise SaaS with custom, AI-native solutions:
- Database: Supabase PostgreSQL with pgvector for AI capabilities
- Frontend: Next.js 15 with App Router for optimal performance
- Authentication: Supabase Auth with Row Level Security
- Email: Resend for transactional emails and automated sequences
- Search: pgvector for semantic search, Typesense for keyword search
- Hosting: Vercel with edge functions for global performance

## Team Scaling Guidelines
- All code follows strict TypeScript patterns for team consistency
- Component architecture designed for parallel development
- Database schema with proper migrations for safe updates
- Environment variable management across development/staging/production
- Testing strategy for confident deployments
- Documentation standards for effective knowledge transfer

## Technical Debt Management
- Regular dependency updates and security patches
- Performance monitoring with real user metrics
- Code quality gates with ESLint and Prettier
- Database query optimization and indexing strategies
- Bundle size monitoring and optimization
- Automated testing coverage requirements

## Performance Optimization Strategies
- Image optimization with Next.js Image component
- Database query optimization with Supabase indexes
- Caching strategies for API responses
- Code splitting and lazy loading
- Edge function deployment for global performance
- Real-time features with Supabase subscriptions
`;