import { Button } from '@/components/ui/button';
import { formatPhone, formatCurrency } from '@/lib/formatters';
import type { Conversation } from '@/hooks/useConversations';
import { Icon } from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onViewQuote: () => void;
  onPauseResume?: () => void;
  onMarkWon?: () => void;
}

export default function ConversationHeader({
  conversation,
  onBack,
  onViewQuote,
  onPauseResume,
  onMarkWon,
}: ConversationHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
      {/* Back button (mobile) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="lg:hidden flex-shrink-0"
      >
        <Icon name="arrowLeft" size="lg" />
      </Button>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium flex-shrink-0">
        {conversation.customerName.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-foreground truncate">
          {conversation.customerName}
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatPhone(conversation.customerPhone)}</span>
          <span>•</span>
          <span>{formatCurrency(conversation.quoteAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <a href={`tel:${conversation.customerPhone}`}>
            <Icon name="phone" size="lg" />
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Icon name="moreVertical" size="lg" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewQuote}>
              <Icon name="externalLink" size="sm" className="mr-2" />
              View Quote
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {conversation.status === 'active' && onPauseResume && (
              <DropdownMenuItem onClick={onPauseResume}>
                <Icon name="pause" size="sm" className="mr-2" />
                Pause Follow-up
              </DropdownMenuItem>
            )}
            
            {conversation.status === 'paused' && onPauseResume && (
              <DropdownMenuItem onClick={onPauseResume}>
                <Icon name="play" size="sm" className="mr-2" />
                Resume Follow-up
              </DropdownMenuItem>
            )}
            
            {!['won', 'lost'].includes(conversation.status) && onMarkWon && (
              <DropdownMenuItem onClick={onMarkWon} className="text-emerald-600">
                <Icon name="trophy" size="sm" className="mr-2" />
                Mark as Won
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
