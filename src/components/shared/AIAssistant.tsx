"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: {
    label: string
    action: string
    data?: Record<string, unknown>
  }[]
  status?: 'pending' | 'complete'
}

interface AIAssistantProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AIAssistant({ open, onOpenChange }: AIAssistantProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your Selestial assistant. I can help you create quotes, send messages, find customers, and more. What would you like to do?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          history: messages.slice(-10),
        }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process that request.",
        actions: data.actions,
        status: data.status,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI Assistant error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, data?: Record<string, unknown>) => {
    switch (action) {
      case 'view_quote':
        router.push(`/quotes?id=${data?.id}`)
        onOpenChange(false)
        break
      case 'send_message':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ Message sent to ${data?.customerName}!`,
        }])
        break
      case 'view_customer':
        router.push(`/customers/${data?.id}`)
        onOpenChange(false)
        break
      case 'create_quote':
        router.push('/quotes?new=true')
        onOpenChange(false)
        break
      case 'open_inbox':
        router.push('/inbox')
        onOpenChange(false)
        break
    }
  }

  const suggestions = [
    "Create a quote for $200 house cleaning",
    "Show my pending quotes",
    "Send follow-up to recent quotes",
    "What's my win rate this month?",
  ]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Chat Window */}
      <div className="relative w-full max-w-md h-[600px] max-h-[80vh] bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-primary to-[#9D96FF]">
          <div className="flex items-center gap-2 text-primary-foreground">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Icon name="sparkles" size="sm" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Selestial AI</h3>
              <p className="text-xs text-white/70">Your smart assistant</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Icon name="close" size="lg" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Action Buttons */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleAction(action.action, action.data)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-background text-primary text-xs font-medium rounded-full hover:bg-muted transition-colors border border-primary/20"
                      >
                        {action.action === 'view_quote' && <Icon name="fileText" size="xs" />}
                        {action.action === 'send_message' && <Icon name="send" size="xs" />}
                        {action.action === 'view_customer' && <Icon name="users" size="xs" />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {message.status === 'complete' && (
                  <div className="flex items-center gap-1.5 mt-2 text-emerald-600 text-xs">
                    <Icon name="checkCircle" size="xs" />
                    Action completed
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="spinner" size="sm" className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (only show if no messages from user) */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-10 w-10 rounded-xl"
            >
              {loading ? (
                <Icon name="spinner" size="sm" className="animate-spin" />
              ) : (
                <Icon name="send" size="sm" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press <kbd className="px-1 py-0.5 bg-background border rounded text-[10px]">⌘J</kbd> to toggle
          </p>
        </div>
      </div>
    </div>
  )
}
