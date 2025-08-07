import { ProjectConfig } from '../../types';

export async function generateProject(config: ProjectConfig): Promise<void> {
  const fs = await import('fs/promises');
  
  // Create project directory
  await fs.mkdir(config.name, { recursive: true });
  process.chdir(config.name);
  
  // Generate package.json
  await generatePackageJson(config);
  
  // Generate Next.js configuration
  await generateNextConfig();
  
  // Generate TypeScript configuration
  await generateTsConfig();
  
  // Generate TailwindCSS configuration
  await generateTailwindConfig();
  
  // Generate basic project structure
  await generateProjectStructure();
  
  // Generate basic components
  await generateBaseComponents(config);
  
  // Generate environment file template
  await generateEnvExample(config);
  
  // Generate .gitignore
  await generateGitignore();
  
  // Generate README.md
  await generateReadme(config);
}

async function generatePackageJson(config: ProjectConfig): Promise<void> {
  const packageJson = {
    name: config.name,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev --turbo',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      'type-check': 'tsc --noEmit',
    },
    dependencies: {
      next: '^15.0.0',
      react: '^18.0.0',
      'react-dom': '^18.0.0',
      ...(config.services.includes('supabase') && {
        '@supabase/ssr': '^0.5.0',
        '@supabase/supabase-js': '^2.45.0',
      }),
      ...(config.services.includes('resend') && {
        resend: '^4.0.0',
      }),
      ...(config.services.includes('typesense') && {
        typesense: '^1.8.0',
      }),
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
      eslint: '^8.0.0',
      'eslint-config-next': '^15.0.0',
      tailwindcss: '^3.4.0',
      typescript: '^5.0.0',
      autoprefixer: '^10.0.0',
      postcss: '^8.0.0',
    },
    engines: {
      node: '>=18.0.0',
    },
  };

  const fs = await import('fs/promises');
  await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
}

async function generateNextConfig(): Promise<void> {
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveExtensions: [
        '.mdx',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
  },
  eslint: {
    dirs: ['app', 'lib', 'components'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
`;

  const fs = await import('fs/promises');
  await fs.writeFile('next.config.js', nextConfig);
}

async function generateTsConfig(): Promise<void> {
  const tsConfig = {
    compilerOptions: {
      lib: ['dom', 'dom.iterable', 'es6'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [
        {
          name: 'next',
        },
      ],
      baseUrl: '.',
      paths: {
        '@/*': ['./*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  };

  const fs = await import('fs/promises');
  await fs.writeFile('tsconfig.json', JSON.stringify(tsConfig, null, 2));
}

async function generateTailwindConfig(): Promise<void> {
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
`;

  const fs = await import('fs/promises');
  await fs.writeFile('tailwind.config.js', tailwindConfig);
}

async function generateProjectStructure(): Promise<void> {
  const directories = [
    'app',
    'app/api',
    'components',
    'components/ui',
    'lib',
    'public',
  ];

  const fs = await import('fs/promises');
  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function generateBaseComponents(config: ProjectConfig): Promise<void> {
  const fs = await import('fs/promises');
  
  // Generate app/layout.tsx
  const layout = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${config.name}',
  description: 'Built with Quallaa CLI - AI-native development for domain experts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`;

  await fs.writeFile('app/layout.tsx', layout);
  
  // Generate app/page.tsx
  const page = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center">
          Welcome to ${config.name}
        </h1>
        <p className="text-center mt-4 text-lg text-gray-600">
          Built with Quallaa CLI - AI-native development for domain experts
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${generateServiceCards(config.services)}
        </div>
      </div>
    </main>
  )
}
`;

  await fs.writeFile('app/page.tsx', page);
  
  // Generate app/globals.css
  const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`;

  await fs.writeFile('app/globals.css', globalsCss);
  
  // Generate lib/types.ts
  const types = `export interface User {
  id: string
  email: string
  name?: string
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}
`;

  await fs.writeFile('lib/types.ts', types);
  
  // Generate service-specific files
  if (config.services.includes('supabase')) {
    await generateSupabaseConfig();
  }
  
  if (config.services.includes('resend')) {
    await generateResendConfig();
  }
}

function generateServiceCards(services: string[]): string {
  const serviceCards = {
    vercel: `
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Vercel</h3>
            <p className="text-gray-600">Hosting and deployment configured</p>
          </div>`,
    supabase: `
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Supabase</h3>
            <p className="text-gray-600">Database and authentication ready</p>
          </div>`,
    github: `
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">GitHub</h3>
            <p className="text-gray-600">Version control configured</p>
          </div>`,
    resend: `
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Resend</h3>
            <p className="text-gray-600">Email service configured</p>
          </div>`,
    typesense: `
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Typesense</h3>
            <p className="text-gray-600">Search engine configured</p>
          </div>`,
  };
  
  return services.map(service => serviceCards[service as keyof typeof serviceCards] || '').join('');
}

async function generateSupabaseConfig(): Promise<void> {
  const fs = await import('fs/promises');
  
  const supabaseConfig = `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`;

  await fs.writeFile('lib/supabase.ts', supabaseConfig);
  
  // Generate middleware.ts for auth
  const middleware = `import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
`;

  await fs.writeFile('middleware.ts', middleware);
}

async function generateResendConfig(): Promise<void> {
  const fs = await import('fs/promises');
  
  const resendConfig = `import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
`;

  await fs.writeFile('lib/resend.ts', resendConfig);
}

async function generateEnvExample(config: ProjectConfig): Promise<void> {
  const envVars = ['# Environment Variables'];
  
  if (config.services.includes('supabase')) {
    envVars.push('', '# Supabase');
    envVars.push('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    envVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
    envVars.push('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  }
  
  if (config.services.includes('resend')) {
    envVars.push('', '# Resend');
    envVars.push('RESEND_API_KEY=your_resend_api_key');
  }
  
  if (config.services.includes('typesense')) {
    envVars.push('', '# Typesense (Optional)');
    envVars.push('TYPESENSE_HOST=your_typesense_host');
    envVars.push('TYPESENSE_PORT=443');
    envVars.push('TYPESENSE_PROTOCOL=https');
    envVars.push('TYPESENSE_API_KEY=your_typesense_api_key');
  }

  const fs = await import('fs/promises');
  await fs.writeFile('.env.example', envVars.join('\n'));
}

async function generateGitignore(): Promise<void> {
  const gitignore = `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Supabase
/supabase/.temp
/supabase/.branches
/supabase/.projects

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;

  const fs = await import('fs/promises');
  await fs.writeFile('.gitignore', gitignore);
}

async function generateReadme(config: ProjectConfig): Promise<void> {
  const readme = `# ${config.name}

Built with [Quallaa CLI](https://quallaa.com) - AI-native development for domain experts.

## Services Configured

${config.services.map(service => `- **${service}**: ${getServiceDescription(service)}`).join('\n')}

## Getting Started

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env.local
   # Fill in your service credentials
   \`\`\`

3. **${config.services.includes('supabase') ? 'Start Supabase:' : 'Configure your database:'}**
   ${config.services.includes('supabase') ? 
     '```bash\n   supabase start\n   supabase db push\n   ```' : 
     'Configure your chosen database solution.'}

4. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open [http://localhost:3000](http://localhost:3000)** to see your application.

## Project Structure

- \`app/\` - Next.js 15 App Router pages and layouts
- \`components/\` - Reusable React components
- \`lib/\` - Utility functions and configurations
- \`public/\` - Static assets

## Available Scripts

- \`npm run dev\` - Start development server with Turbopack
- \`npm run build\` - Build the application for production
- \`npm run start\` - Start the production server
- \`npm run lint\` - Run ESLint
- \`npm run type-check\` - Run TypeScript type checking

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
${config.services.includes('supabase') ? '- [Supabase Documentation](https://supabase.com/docs)' : ''}
${config.services.includes('vercel') ? '- [Vercel Documentation](https://vercel.com/docs)' : ''}
- [Quallaa Documentation](https://docs.quallaa.com)

## Support

For support with this application, visit [Quallaa Support](https://quallaa.com/support) or check the generated \`CLAUDE.md\` file for detailed context.
`;

  const fs = await import('fs/promises');
  await fs.writeFile('README.md', readme);
}

function getServiceDescription(service: string): string {
  const descriptions = {
    vercel: 'Hosting and deployment',
    supabase: 'Database and authentication',
    github: 'Version control',
    resend: 'Email service',
    typesense: 'Search engine',
  };
  
  return descriptions[service as keyof typeof descriptions] || 'Service configured';
}