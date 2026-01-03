import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import type { Conversation } from '@/hooks/useConversations';
import { MessageSquare, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export default function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect 
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Messages will appear here when you start following up on quotes.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className={cn(
            'w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors',
            selectedId === conversation.id && 'bg-primary/10 hover:bg-primary/10',
            conversation.unreadCount > 0 && 'bg-primary/5'
          )}
        >
          <div className="flex items-start gap-3">
            {/* Avatar / Unread indicator */}
            <div className="relative flex-shrink-0">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                conversation.unreadCount > 0 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              )}>
                {conversation.customerName.charAt(0).toUpperCase()}
              </div>
              {conversation.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={cn(
                  'font-medium truncate',
                  conversation.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'
                )}>
                  {conversation.customerName}
                </span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {conversation.lastMessageAt && 
                    formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })
                  }
                </span>
              </div>

              <div className="flex items-center gap-1 mt-0.5">
                {conversation.lastMessageDirection === 'inbound' ? (
                  <ArrowDownLeft className="w-3 h-3 text-primary flex-shrink-0" />
                ) : (
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                )}
                <p className={cn(
                  'text-sm truncate',
                  conversation.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {conversation.lastMessagePreview || 'No messages'}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(conversation.quoteAmount)}
                </span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  conversation.status === 'active' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                  conversation.status === 'won' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                  conversation.status === 'lost' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  conversation.status === 'paused' && 'bg-muted text-muted-foreground',
                  conversation.status === 'new' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                )}>
                  {conversation.status}
                </span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
