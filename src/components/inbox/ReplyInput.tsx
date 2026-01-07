import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/icon';

interface ReplyInputProps {
  onSend: (content: string) => Promise<{ error: string | null }>;
  sending: boolean;
  disabled?: boolean;
}

export default function ReplyInput({ onSend, sending, disabled }: ReplyInputProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [content]);

  const handleSend = async () => {
    if (!content.trim() || sending || disabled) return;

    setError(null);
    const result = await onSend(content);
    
    if (result.error) {
      setError(result.error);
    } else {
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      {error && (
        <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={sending || disabled}
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || sending || disabled}
          size="icon"
          className="flex-shrink-0 h-11 w-11"
        >
          {sending ? (
            <Icon name="spinner" size="lg" className="animate-spin" />
          ) : (
            <Icon name="send" size="lg" />
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
