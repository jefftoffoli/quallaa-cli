# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Project Name:** my-app
**Role:** Technical Co-Founder / First Engineer Context
**Services:** vercel, supabase, github, resend
**Generated:** 2025-08-07T01:52:34.328Z

This system empowers technical leaders to build scalable, AI-native solutions without vendor lock-in or expensive SaaS dependencies.

## Development Commands

- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run type-check` - Run TypeScript type checking


### Supabase Commands
- `supabase start` - Start local Supabase development environment
- `supabase db push` - Push schema changes to database
- `supabase db pull` - Pull schema changes from remote database
- `supabase migration new <name>` - Create new migration file
- `supabase gen types typescript --local` - Generate TypeScript types


### Vercel Commands
- `vercel dev` - Start Vercel development server locally
- `vercel` - Deploy to preview environment
- `vercel --prod` - Deploy to production
- `vercel env pull` - Pull environment variables from Vercel


## Environment Variables

# Configure environment variables based on your services

## Project Purpose

This application serves as the technical foundation for scaling your startup with AI-native infrastructure. Instead of paying for multiple SaaS subscriptions, you own your entire stack and can customize it exactly to your business needs.

## Architecture

This is a Next.js 15 application using the App Router architecture with TypeScript and modern tooling.

### Key Structure
- **App Router**: Uses Next.js App Router with `app/` directory structure
- **Styling**: TailwindCSS with CSS custom properties for theming
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with user management
- **Email**: Resend for transactional emails
- **Search**: pgvector for semantic search
- **Hosting**: Vercel with edge functions

### Directory Structure
- `app/` - App Router pages and layouts
  - `layout.tsx` - Root layout with configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with design system
  - `api/` - API routes for server-side functionality
- `components/` - Reusable UI components
  - `ui/` - Base UI components (buttons, forms, etc.)
  - `sections/` - Page section components
- `lib/` - Utility libraries and configurations
  - `supabase.ts` - Database client configuration
  - `types.ts` - TypeScript type definitions
- `middleware.ts` - Authentication and routing middleware


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


## Libraries & Dependencies

### Core Framework
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety and developer experience
- **TailwindCSS**: Utility-first styling system

### Technical Co-Founder / First Engineer Context Libraries
- **Next.js** - Full-stack React framework
- **TypeScript** - Type safety and developer experience
- **TailwindCSS** - Utility-first styling system
- **Prisma** - Type-safe database ORM
- **React Hook Form** - Form state management
- **Zod** - Runtime type validation
- **React Query** - Server state management
- **Vercel Analytics** - Performance monitoring

### Database & Backend
- **Supabase**: PostgreSQL with Row Level Security
- **pgvector**: Vector embeddings for AI-powered search
- **Real-time**: Live data updates with WebSocket subscriptions
- **Migrations**: Version-controlled schema changes

### Authentication & Security
- **Supabase Auth**: Built-in authentication with multiple providers
- **Row Level Security**: Database-level access control
- **JWT Sessions**: Secure token-based session management
- **User Management**: Built-in user registration and management

### Email & Communications  
- **Resend**: Transactional email delivery
- **Email Templates**: HTML email template system
- **Delivery Tracking**: Open and click tracking
- **Domain Authentication**: DKIM and SPF configuration

### Analytics & Monitoring
- **Vercel Analytics**: Performance and user analytics (zero-config)
- **Custom Analytics**: Track user behavior in your database

## Common Technical Co-Founder / First Engineer Context Tasks

- Design scalable architecture for rapid growth
- Build MVP with production-ready infrastructure
- Implement monitoring and observability
- Set up CI/CD pipelines for team development
- Create technical documentation for team onboarding
- Establish code review and quality processes
- Plan technical roadmap aligned with business goals
- Optimize costs while maintaining performance

## Development Guidelines

### Code Organization
- Follow Next.js App Router conventions
- Use TypeScript for all components and utilities
- Implement proper error handling and loading states
- Create reusable components with consistent props

### Database Guidelines
- Use Row Level Security policies for all tables
- Create migrations for schema changes
- Generate TypeScript types from database schema
- Use real-time subscriptions for live data
- Implement proper indexing for performance

### Authentication Guidelines  
- Use Supabase Auth for user management
- Implement proper session handling in middleware
- Use RLS policies for data access control
- Handle authentication state in React components
- Implement proper error handling for auth flows

### Performance Guidelines
- Optimize images with Next.js Image component
- Implement proper caching strategies
- Use React Suspense for loading states
- Minimize bundle size with code splitting

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   Copy `.env.example` to `.env.local` and fill in your service credentials.

3. **Initialize Database**
   ```bash
   supabase start
   supabase db push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Support & Resources

- **Quallaa Documentation**: [https://docs.quallaa.com](https://docs.quallaa.com)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Vercel Documentation**: [https://vercel.com/docs](https://vercel.com/docs)
- **Resend Documentation**: [https://resend.com/docs](https://resend.com/docs)

---

*Generated by Quallaa CLI - AI-native development for domain experts*
