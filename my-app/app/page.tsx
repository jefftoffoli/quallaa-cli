export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center">
          Welcome to my-app
        </h1>
        <p className="text-center mt-4 text-lg text-gray-600">
          Built with Quallaa CLI - AI-native development for domain experts
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Vercel</h3>
            <p className="text-gray-600">Hosting and deployment configured</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Supabase</h3>
            <p className="text-gray-600">Database and authentication ready</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">GitHub</h3>
            <p className="text-gray-600">Version control configured</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Resend</h3>
            <p className="text-gray-600">Email service configured</p>
          </div>
        </div>
      </div>
    </main>
  )
}
