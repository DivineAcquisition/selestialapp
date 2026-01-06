"use client"

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import AIAssistant from './AIAssistant'

export default function AIFloatingButton() {
  const [open, setOpen] = useState(false)

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
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-r from-primary to-[#9D96FF]",
          "text-primary-foreground shadow-lg shadow-primary/30",
          "flex items-center justify-center",
          "hover:scale-110 hover:shadow-xl hover:shadow-primary/40",
          "transition-all duration-200",
          "group"
        )}
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ask AI
          <kbd className="ml-2 px-1.5 py-0.5 bg-background/20 rounded text-xs">⌘J</kbd>
        </span>
      </button>
      
      <AIAssistant open={open} onOpenChange={setOpen} />
    </>
  )
}
