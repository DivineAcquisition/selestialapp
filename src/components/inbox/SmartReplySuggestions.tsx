import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  Send,
  Edit2,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
            <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">AI is thinking...</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">Generating smart replies</p>
          </div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
            AI Suggested Replies
          </span>
          <span className="text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
            {suggestions.length} options
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate();
            }}
            className="p-1 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded"
            title="Regenerate suggestions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="p-1 text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />
          )}
        </div>
      </div>

      {/* Suggestions */}
      {!collapsed && (
        <div className="p-3 pt-0 space-y-2">
          {suggestions.map((suggestion, index) => (
            <div key={index}>
              {editingIndex === index ? (
                // Edit mode
                <div className="space-y-2">
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-[80px] text-sm bg-white dark:bg-gray-900"
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
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
                        <Send className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="group relative p-3 bg-white dark:bg-gray-900 rounded-lg border border-indigo-100 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                  <p className="text-sm text-gray-700 dark:text-gray-200 pr-20">
                    {suggestion}
                  </p>
                  
                  {/* Character count */}
                  <span className={cn(
                    "absolute bottom-2 left-3 text-xs",
                    suggestion.length > 160 ? "text-amber-500 dark:text-amber-400" : "text-gray-400 dark:text-gray-500"
                  )}>
                    {suggestion.length} chars
                  </span>
                  
                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(index, suggestion)}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <Button
                      size="sm"
                      className="h-7"
                      onClick={() => onSelectSuggestion(suggestion, index, false)}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Feedback */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-indigo-100 dark:border-indigo-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">Were these helpful?</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onFeedback('helpful')}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"
                title="Helpful"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onFeedback('not_helpful')}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                title="Not helpful"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
