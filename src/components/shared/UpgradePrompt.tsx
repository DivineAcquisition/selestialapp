"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Rocket, Zap, Lock, Crown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UpgradePromptProps {
  feature: string
  description?: string
  variant?: 'inline' | 'banner' | 'card'
  className?: string
}

export default function UpgradePrompt({ 
  feature, 
  description,
  variant = 'inline',
  className,
}: UpgradePromptProps) {
  const router = useRouter()
  
  const handleUpgrade = () => {
    router.push('/billing')
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        "bg-gradient-to-r from-primary to-[#9D96FF] rounded-xl p-4 text-white",
        className
      )}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Upgrade to Growth</p>
              <p className="text-sm text-white/80">
                {description || `Unlock ${feature} and more powerful features`}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleUpgrade}
            className="bg-white text-primary hover:bg-white/90 font-semibold"
          >
            Upgrade Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "border border-primary/20 rounded-xl p-6 bg-primary/5 text-center",
        className
      )}>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Unlock {feature}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {description || 'This feature is available on the Growth plan'}
        </p>
        <Button onClick={handleUpgrade} className="gap-2">
          <Zap className="w-4 h-4" />
          Upgrade to Growth
        </Button>
      </div>
    )
  }

  // Default inline variant
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg",
      className
    )}>
      <div className="p-1.5 bg-primary/10 rounded-md">
        <Lock className="w-4 h-4 text-primary" />
      </div>
      <span className="text-sm text-muted-foreground flex-1">
        {description || `${feature} requires the Growth plan`}
      </span>
      <Button 
        size="sm" 
        onClick={handleUpgrade}
        className="gap-1.5"
      >
        <Zap className="w-3.5 h-3.5" />
        Upgrade
      </Button>
    </div>
  )
}
