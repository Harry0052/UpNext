import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import {
  Rocket,
  Users,
  FolderKanban,
  Zap,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Find Your People',
    description:
      'Discover who is building on your campus. Connect with founders, engineers, designers, and operators.',
  },
  {
    icon: FolderKanban,
    title: 'Ship Together',
    description:
      'Create project pages, recruit teammates, track milestones, and share progress updates.',
  },
  {
    icon: Zap,
    title: 'Build Reputation',
    description:
      'Earn vouches, track your shipped streak, and build social proof by helping and delivering.',
  },
  {
    icon: GraduationCap,
    title: 'Campus-First',
    description:
      'Verified .edu accounts only. See what\'s happening at your school and across top campuses.',
  },
]

const stats = [
  { value: '200+', label: 'Campuses' },
  { value: '10K+', label: 'Builders' },
  { value: '2K+', label: 'Projects' },
  { value: '50K+', label: 'Connections Made' },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm mb-8">
            <Rocket className="h-4 w-4 text-primary" />
            <span>The network for student builders</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Where college
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              builders connect
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Discover founders on your campus. Join projects that matter.
            Find teammates, share progress, and build your reputation by shipping.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="h-12 px-8 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
            >
              <Link href="/signup">
                Get Started with .edu
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link href="/explore">Explore</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Everything you need to build</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              UpNext gives student builders the tools and community to go from idea to launch.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card/50 p-8 hover:bg-card transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to build?</h2>
          <p className="text-muted-foreground mt-3">
            Join thousands of student builders shipping real projects.
          </p>
          <div className="mt-8 space-y-3">
            <Button
              size="lg"
              asChild
              className="h-12 px-8 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
            >
              <Link href="/signup">
                Create Your Account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Free forever
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                .edu email required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                200+ campuses
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <Logo />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} UpNext. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
