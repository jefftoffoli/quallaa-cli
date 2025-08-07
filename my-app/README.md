# my-app

Built with [Quallaa CLI](https://quallaa.com) - AI-native development for domain experts.

## Services Configured

- **vercel**: Hosting and deployment
- **supabase**: Database and authentication
- **github**: Version control
- **resend**: Email service

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Fill in your service credentials
   ```

3. **Start Supabase:**
   ```bash
   supabase start
   supabase db push
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** to see your application.

## Project Structure

- `app/` - Next.js 15 App Router pages and layouts
- `components/` - Reusable React components
- `lib/` - Utility functions and configurations
- `public/` - Static assets

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Quallaa Documentation](https://docs.quallaa.com)

## Support

For support with this application, visit [Quallaa Support](https://quallaa.com/support) or check the generated `CLAUDE.md` file for detailed context.
