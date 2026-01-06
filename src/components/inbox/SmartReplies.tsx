"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Send, Edit2, RefreshCw, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartRepliesProps {
  suggestions: string[]
  loading: boolean
  onSelect: (text: string) => void
  onRegenerate: () => void
  onDismiss: () => void
}

export default function SmartReplies({
  suggestions,
  loading,
  onSelect,
  onRegenerate,
  onDismiss,
}: SmartRepliesProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedText, setEditedText] = useState('')

  if (loading) {
    return (
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI is thinking...</p>
            <p className="text-xs text-muted-foreground">Generating smart replies</p>
          </div>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">
            AI Suggested Replies
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRegenerate}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="p-3 space-y-2">
        {suggestions.map((suggestion, index) => (
          <div key={index}>
            {editingIndex === index ? (
              <div className="space-y-2">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-3 text-sm bg-background border border-border rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  rows={3}
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs",
                    editedText.length > 160 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {editedText.length} chars
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingIndex(null)
                        setEditedText('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        onSelect(editedText)
                        setEditingIndex(null)
                        setEditedText('')
                      }}
                      disabled={!editedText.trim()}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="group relative p-3 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors">
                <p className="text-sm text-foreground pr-20">
                  {suggestion}
                </p>
                
                <span className={cn(
                  "absolute bottom-2 left-3 text-xs",
                  suggestion.length > 160 ? "text-amber-500" : "text-muted-foreground"
                )}>
                  {suggestion.length} chars
                </span>
                
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingIndex(index)
                      setEditedText(suggestion)
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <Button
                    size="sm"
                    onClick={() => onSelect(suggestion)}
                    className="h-7"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
