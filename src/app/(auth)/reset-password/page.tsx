"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords don\'t match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground">Password updated</h1>
          <p className="text-muted-foreground mt-2">
            Your password has been reset successfully.<br />
            Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create new password</h1>
        <p className="text-muted-foreground mt-2">
          Your new password must be at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="mt-1.5 h-12"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="mt-1.5 h-12"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base glow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset password'}
        </Button>
      </form>
    </div>
  )
}
