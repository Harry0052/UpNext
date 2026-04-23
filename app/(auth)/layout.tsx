import { Logo } from '@/components/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="relative flex flex-col justify-between p-12 text-white">
          <Logo className="text-white [&_span]:text-white" />
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Where college builders
              <br />
              find their people.
            </h1>
            <p className="text-lg text-white/70 max-w-md">
              Discover founders on your campus, join projects that matter,
              and build your reputation by shipping.
            </p>
          </div>
          <p className="text-sm text-white/50">
            Join thousands of student builders across 200+ campuses.
          </p>
        </div>
      </div>

      {/* Right panel — forms */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
