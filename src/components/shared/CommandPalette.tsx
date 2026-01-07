"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  FileText,
  Users,
  MessageSquare,
  Zap,
  BarChart3,
  Settings,
  Plus,
  Search,
  CreditCard,
  Sparkles,
  Home,
  LogOut,
  Phone,
  Target,
  Link as LinkIcon,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenAI?: () => void
}

export default function CommandPalette({ open, onOpenChange, onOpenAI }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open) setSearch('')
  }, [open])

  const actions = [
    {
      id: 'ai',
      name: 'Ask AI Assistant',
      icon: Sparkles,
      shortcut: '⌘J',
      action: () => {
        onOpenChange(false)
        onOpenAI?.()
      },
      category: 'AI',
    },
    {
      id: 'new-quote',
      name: 'Create New Quote',
      icon: Plus,
      shortcut: '⌘N',
      action: () => router.push('/quotes?new=true'),
      category: 'Create',
    },
    {
      id: 'new-customer',
      name: 'Add Customer',
      icon: Users,
      action: () => router.push('/customers?new=true'),
      category: 'Create',
    },
    {
      id: 'new-sequence',
      name: 'Create Sequence',
      icon: Zap,
      action: () => router.push('/sequences?new=true'),
      category: 'Create',
    },
    {
      id: 'dashboard',
      name: 'Go to Dashboard',
      icon: Home,
      shortcut: '⌘D',
      action: () => router.push('/'),
      category: 'Navigate',
    },
    {
      id: 'quotes',
      name: 'View Quotes',
      icon: FileText,
      action: () => router.push('/quotes'),
      category: 'Navigate',
    },
    {
      id: 'customers',
      name: 'View Customers',
      icon: Users,
      action: () => router.push('/customers'),
      category: 'Navigate',
    },
    {
      id: 'inbox',
      name: 'Open Inbox',
      icon: MessageSquare,
      shortcut: '⌘I',
      action: () => router.push('/inbox'),
      category: 'Navigate',
    },
    {
      id: 'sequences',
      name: 'View Sequences',
      icon: Zap,
      action: () => router.push('/sequences'),
      category: 'Navigate',
    },
    {
      id: 'campaigns',
      name: 'View Campaigns',
      icon: Target,
      action: () => router.push('/campaigns'),
      category: 'Navigate',
    },
    {
      id: 'analytics',
      name: 'View Analytics',
      icon: BarChart3,
      action: () => router.push('/analytics'),
      category: 'Navigate',
    },
    {
      id: 'connections',
      name: 'Connections',
      icon: LinkIcon,
      action: () => router.push('/connections'),
      category: 'Settings',
    },
    {
      id: 'billing',
      name: 'Billing & Plans',
      icon: CreditCard,
      action: () => router.push('/billing'),
      category: 'Settings',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      action: () => router.push('/settings'),
      category: 'Settings',
    },
    {
      id: 'logout',
      name: 'Sign Out',
      icon: LogOut,
      action: async () => {
        await supabase.auth.signOut()
        router.push('/login')
      },
      category: 'Account',
    },
  ]

  const handleSelect = (action: typeof actions[0]) => {
    onOpenChange(false)
    action.action()
  }

  const categories = [...new Set(actions.map(a => a.category))]

  if (!open) return null

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command Palette"
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl px-4">
        <div className="bg-background rounded-2xl shadow-2xl border overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search or type a command..."
              className="flex-1 text-base outline-none placeholder-muted-foreground bg-transparent"
            />
            <kbd className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-muted-foreground">
              No results found.
            </Command.Empty>

            {categories.map(category => (
              <Command.Group key={category} heading={category}>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
                {actions
                  .filter(a => a.category === category)
                  .map(action => (
                    <Command.Item
                      key={action.id}
                      value={action.name}
                      onSelect={() => handleSelect(action)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/5 data-[selected=true]:bg-primary/10"
                    >
                      <action.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1 text-foreground">{action.name}</span>
                      {action.shortcut && (
                        <kbd className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                          {action.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t bg-muted/30 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  )
}
