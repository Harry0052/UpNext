import { Metadata } from 'next'
import { SignUpForm } from './signup-form'

export const metadata: Metadata = {
  title: 'Sign Up',
}

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        <p className="text-muted-foreground">
          Use your .edu email to join UpNext
        </p>
      </div>
      <SignUpForm />
    </div>
  )
}
