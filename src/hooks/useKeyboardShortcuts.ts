import { useEffect } from 'react';

interface Shortcuts {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }
      
      // Build key combo string
      const combo = [
        e.metaKey || e.ctrlKey ? 'cmd' : '',
        e.shiftKey ? 'shift' : '',
        e.altKey ? 'alt' : '',
        e.key.toLowerCase(),
      ].filter(Boolean).join('+');
      
      // Check for match
      const handler = shortcuts[combo] || shortcuts[e.key.toLowerCase()];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
