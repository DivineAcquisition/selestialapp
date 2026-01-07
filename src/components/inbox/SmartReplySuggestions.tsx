import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface SmartReplySuggestionsProps {
  suggestions: string[];
  loading: boolean;
  onSelectSuggestion: (text: string, index: number, wasEdited: boolean) => void;
  onRegenerate: () => void;
  onFeedback: (feedback: 'helpful' | 'not_helpful') => void;
  onDismiss: () => void;
}

export default function SmartReplySuggestions({
  suggestions,
  loading,
  onSelectSuggestion,
  onRegenerate,
  onFeedback,
  onDismiss,
}: SmartReplySuggestionsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedText, setEditedText] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const handleEdit = (index: number, text: string) => {
    setEditingIndex(index);
    setEditedText(text);
  };

  const handleSendEdited = () => {
    if (editingIndex !== null && editedText.trim()) {
      onSelectSuggestion(editedText, editingIndex, true);
      setEditingIndex(null);
      setEditedText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditedText('');
  };

  if (loading) {
    return (
      <div className="border-t border-border p-4 bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="spinner" size="md" className="text-primary animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI is thinking...</p>
            <p className="text-xs text-muted-foreground">Generating smart replies</p>
          </div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border bg-primary/5">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="sparkles" size="sm" className="text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">
            AI Suggested Replies
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {suggestions.length} options
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate();
            }}
            className="p-1 text-primary hover:text-primary/80 hover:bg-primary/10 rounded"
            title="Regenerate suggestions"
          >
            <Icon name="refresh" size="md" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
            title="Dismiss"
          >
            <Icon name="close" size="md" />
          </button>
          <Icon name={collapsed ? "chevronUp" : "chevronDown"} size="md" className="text-muted-foreground" />
        </div>
      </button>

      {/* Suggestions */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {suggestions.map((suggestion, index) => (
            <div key={index}>
              {editingIndex === index ? (
                // Edit mode
                <div className="space-y-2">
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-[80px] text-sm bg-background"
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {editedText.length}/160 chars
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSendEdited}
                        disabled={!editedText.trim()}
                      >
                        <Icon name="send" size="xs" className="mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="group relative p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <p className="text-sm text-foreground pr-20">
                    {suggestion}
                  </p>
                  
                  {/* Character count */}
                  <span className={cn(
                    "absolute bottom-2 left-3 text-xs",
                    suggestion.length > 160 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {suggestion.length} chars
                  </span>
                  
                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(index, suggestion)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                      title="Edit"
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <Button
                      size="sm"
                      className="h-7"
                      onClick={() => onSelectSuggestion(suggestion, index, false)}
                    >
                      <Icon name="send" size="xs" className="mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Feedback */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Were these helpful?</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onFeedback('helpful')}
                className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded"
                title="Helpful"
              >
                <Icon name="thumbsUp" size="md" />
              </button>
              <button
                onClick={() => onFeedback('not_helpful')}
                className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                title="Not helpful"
              >
                <Icon name="thumbsDown" size="md" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
