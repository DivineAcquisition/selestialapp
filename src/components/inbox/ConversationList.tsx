"use client";

import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import type { Conversation } from '@/hooks/useConversations';
import { MessageSquare, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}

const statusConfig = {
  active: { variant: 'info' as const, label: 'Active' },
  won: { variant: 'success' as const, label: 'Won' },
  lost: { variant: 'destructive' as const, label: 'Lost' },
  paused: { variant: 'secondary' as const, label: 'Paused' },
  new: { variant: 'warning' as const, label: 'New' },
  no_response: { variant: 'secondary' as const, label: 'No Response' },
};

export default function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect 
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="w-14 h-14 bg-secondary/50 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">No conversations yet</h3>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          Messages will appear here when you start following up on quotes.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {conversations.map((conversation, index) => {
        const status = statusConfig[conversation.status as keyof typeof statusConfig] || statusConfig.active;
        
        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={cn(
              'w-full px-4 py-3.5 text-left transition-all duration-200 animate-fade-in',
              'hover:bg-secondary/50',
              selectedId === conversation.id && 'bg-primary/10 hover:bg-primary/10 border-l-2 border-l-primary',
              conversation.unreadCount > 0 && selectedId !== conversation.id && 'bg-primary/5'
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex items-start gap-3">
              {/* Avatar / Unread indicator */}
              <div className="relative flex-shrink-0">
                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors',
                  conversation.unreadCount > 0 
                    ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/20' 
                    : 'bg-secondary text-muted-foreground'
                )}>
                  {conversation.customerName.charAt(0).toUpperCase()}
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse-subtle">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    'font-semibold truncate text-sm',
                    conversation.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'
                  )}>
                    {conversation.customerName}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 font-medium">
                    {conversation.lastMessageAt && 
                      formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })
                    }
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <div className={cn(
                    "p-0.5 rounded",
                    conversation.lastMessageDirection === 'inbound' 
                      ? "bg-primary/10" 
                      : "bg-secondary"
                  )}>
                    {conversation.lastMessageDirection === 'inbound' ? (
                      <ArrowDownLeft className="w-3 h-3 text-primary" />
                    ) : (
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className={cn(
                    'text-sm truncate',
                    conversation.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}>
                    {conversation.lastMessagePreview || 'No messages'}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {formatCurrency(conversation.quoteAmount)}
                  </span>
                  <Badge variant={status.variant} size="sm">
                    {status.label}
                  </Badge>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
