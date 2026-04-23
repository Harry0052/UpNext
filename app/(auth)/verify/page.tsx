import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Verify Email',
}

export default function VerifyPage() {
  return (
    <div className="text-center space-y-4 py-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold">Email verified!</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Your account is now active. Let&apos;s set up your profile.
      </p>
      <Button asChild>
        <Link href="/onboarding">Get Started</Link>
      </Button>
    </div>
  )
}
