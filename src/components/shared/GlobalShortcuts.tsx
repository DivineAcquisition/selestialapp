"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CommandPalette from './CommandPalette'
import AIAssistant from './AIAssistant'

export default function GlobalShortcuts() {
  const router = useRouter()
  const [commandOpen, setCommandOpen] = useState(false)
  const [aiOpen, setAIOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Only allow Escape to close modals when in input
        if (e.key === 'Escape') {
          setCommandOpen(false)
          setAIOpen(false)
        }
        return
      }

      // Cmd/Ctrl + K = Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(prev => !prev)
        setAIOpen(false)
      }

      // Cmd/Ctrl + J = AI Assistant
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        setAIOpen(prev => !prev)
        setCommandOpen(false)
      }

      // Cmd/Ctrl + N = New Quote
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        router.push('/quotes?new=true')
      }

      // Cmd/Ctrl + I = Inbox
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        router.push('/inbox')
      }

      // Cmd/Ctrl + D = Dashboard
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        router.push('/')
      }

      // Escape = Close all
      if (e.key === 'Escape') {
        setCommandOpen(false)
        setAIOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return (
    <>
      <CommandPalette 
        open={commandOpen} 
        onOpenChange={setCommandOpen}
        onOpenAI={() => setAIOpen(true)}
      />
      <AIAssistant 
        open={aiOpen} 
        onOpenChange={setAIOpen} 
      />
    </>
  )
}
