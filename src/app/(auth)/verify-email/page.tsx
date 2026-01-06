import Link from 'next/link'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  return (
    <div className="space-y-8">
      {/* Icon and Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            We've sent you a verification link. Click the link in your email to verify your account.
          </p>
        </div>
      </div>

      {/* Help section */}
      <div className="space-y-4">
        <div className="p-5 rounded-xl bg-muted/50 space-y-3">
          <p className="font-medium text-foreground">Didn't receive the email?</p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              Check your spam or junk folder
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              Make sure you entered the correct email
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              Wait a few minutes and check again
            </li>
          </ul>
        </div>

        <Link href="/signup">
          <Button variant="outline" className="w-full h-12">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try signing up again
          </Button>
        </Link>
      </div>

      {/* Back to login */}
      <div className="text-center">
        <Link 
          href="/login" 
          className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
