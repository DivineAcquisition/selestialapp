import { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ThreadMessage } from '@/hooks/useMessageThread';
import { Icon, IconName } from '@/components/ui/icon';

interface MessageThreadProps {
  messages: ThreadMessage[];
  loading: boolean;
}

export default function MessageThread({ messages, loading }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Icon name="spinner" size="xl" className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <p className="text-muted-foreground">No messages yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Send a message to start the conversation
        </p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: ThreadMessage[] }[] = [];
  let currentDate = '';

  messages.forEach((message) => {
    const messageDate = format(new Date(message.createdAt), 'MMM d, yyyy');
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({ date: messageDate, messages: [] });
    }
    groupedMessages[groupedMessages.length - 1].messages.push(message);
  });

  const getStatusIcon = (message: ThreadMessage): { name: IconName; className: string } | null => {
    if (message.direction === 'inbound') return null;
    
    switch (message.status) {
      case 'delivered':
        return { name: 'checkCircle', className: 'text-blue-500' };
      case 'sent':
        return { name: 'check', className: 'text-muted-foreground' };
      case 'failed':
        return { name: 'alertCircle', className: 'text-destructive' };
      default:
        return { name: 'clock', className: 'text-muted-foreground/50' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {groupedMessages.map((group) => (
        <div key={group.date}>
          {/* Date divider */}
          <div className="flex items-center justify-center mb-4">
            <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
              {group.date}
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-3">
            {group.messages.map((message) => {
              const statusIcon = getStatusIcon(message);
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5',
                      message.direction === 'outbound'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className={cn(
                      'flex items-center justify-end gap-1 mt-1',
                      message.direction === 'outbound' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      <span className="text-xs">
                        {format(new Date(message.createdAt), 'h:mm a')}
                      </span>
                      {statusIcon && (
                        <Icon name={statusIcon.name} size="xs" className={statusIcon.className} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
