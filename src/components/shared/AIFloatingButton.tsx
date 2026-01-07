"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import AIAssistant from './AIAssistant'
import { Icon } from '@/components/ui/icon'

// Animated border gradient component
function AnimatedBorderGradient({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative group", className)}>
      {/* Animated gradient border */}
      <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-primary via-[#9D96FF] to-primary opacity-75 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500 animate-border-spin" />
      
      {/* Inner content */}
      <div className="relative rounded-full">
        {children}
      </div>
    </div>
  )
}

export default function AIFloatingButton() {
  const [open, setOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + J = Toggle AI Assistant
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatedBorderGradient>
          <button
            onClick={() => setOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              "relative w-14 h-14 rounded-full",
              "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
              "text-white",
              "flex items-center justify-center",
              "shadow-2xl shadow-primary/20",
              "hover:shadow-primary/40",
              "transition-all duration-300",
              "group overflow-hidden"
            )}
            aria-label="Open AI Assistant"
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-[#9D96FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Animated inner glow */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/10 to-[#9D96FF]/10 animate-pulse" />
            
            {/* Icon container */}
            <div className={cn(
              "relative z-10 transition-transform duration-300",
              isHovered ? "scale-110" : "scale-100"
            )}>
              <Icon 
                name="robot" 
                size="xl" 
                className={cn(
                  "transition-all duration-300",
                  isHovered ? "text-[#9D96FF]" : "text-white"
                )} 
              />
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
              <div className="absolute w-1 h-1 bg-primary/60 rounded-full animate-float-particle-1" style={{ top: '20%', left: '30%' }} />
              <div className="absolute w-1.5 h-1.5 bg-[#9D96FF]/60 rounded-full animate-float-particle-2" style={{ top: '60%', left: '70%' }} />
              <div className="absolute w-1 h-1 bg-white/40 rounded-full animate-float-particle-3" style={{ top: '40%', left: '20%' }} />
            </div>
          </button>
        </AnimatedBorderGradient>
        
        {/* Tooltip */}
        <div className={cn(
          "absolute right-full mr-4 top-1/2 -translate-y-1/2",
          "px-4 py-2 rounded-xl",
          "bg-gray-900/95 backdrop-blur-sm border border-gray-700/50",
          "text-white text-sm font-medium",
          "whitespace-nowrap",
          "pointer-events-none",
          "transition-all duration-200",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        )}>
          <div className="flex items-center gap-2">
            <Icon name="message" size="sm" className="text-primary" />
            <span>Ask AI Assistant</span>
            <kbd className="ml-2 px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400">⌘J</kbd>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
            <div className="border-8 border-transparent border-l-gray-900/95" />
          </div>
        </div>
      </div>
      
      <AIAssistant open={open} onOpenChange={setOpen} />
    </>
  )
}
