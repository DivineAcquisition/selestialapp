import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8 text-primary" />
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
        <p className="text-muted-foreground mt-2">
          We've sent you a verification link.<br />
          Click the link in your email to verify your account.
        </p>
      </div>

      <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
        <p>Didn't receive the email?</p>
        <p className="mt-1">Check your spam folder or try signing up again.</p>
      </div>

      <Link href="/login">
        <Button variant="outline" className="w-full h-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Button>
      </Link>
    </div>
  )
}
